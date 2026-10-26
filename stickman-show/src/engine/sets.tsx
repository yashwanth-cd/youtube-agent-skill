import React from "react";
import { useCurrentFrame } from "remotion";
import { rand } from "./anim";
import { GROUND, H, W } from "./theme";

/**
 * Illustrated backgrounds. Each fills the frame, with the floor starting at GROUND. Decoration
 * sits at the edges and behind a light haze so the beats in the centre always read clearly.
 */
export type SetName = "room" | "office" | "street" | "park" | "stage" | "board" | "kitchen" | "bank";
export const SET_NAMES: SetName[] = ["room", "office", "street", "park", "stage", "board", "kitchen", "bank"];

/** Sets with a dark background: Stick and text switch to light ink there. */
export const DARK_SETS: SetName[] = ["stage"];

const Cloud: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 0.95 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={70} ry={34} fill="#fff" />
    <ellipse cx={-50} cy={10} rx={46} ry={26} fill="#fff" />
    <ellipse cx={55} cy={8} rx={52} ry={28} fill="#fff" />
    <ellipse cx={10} cy={-22} rx={44} ry={30} fill="#fff" />
  </g>
);

const Skyline: React.FC<{ y: number; color: string; seed: number; h: number; windows?: string; f?: number; speed?: number }> = ({ y, color, seed, h, windows, f = 0, speed = 0 }) => {
  const shift = (f * speed) % 2400;
  const blocks = Array.from({ length: 30 }, (_, i) => {
    const w = 70 + rand(seed + i) * 90;
    const bh = h * (0.45 + rand(seed * 3 + i) * 0.55);
    return { w, bh };
  });
  let x = -shift;
  return (
    <g>
      {[0, 1].map((rep) =>
        blocks.map((b, i) => {
          const bx = x;
          x += b.w + 6;
          return (
            <g key={`${rep}-${i}`}>
              <rect x={bx} y={y - b.bh} width={b.w} height={b.bh} fill={color} />
              {windows &&
                Array.from({ length: Math.floor(b.bh / 34) }, (_, r) =>
                  Array.from({ length: Math.floor(b.w / 26) }, (_, c) =>
                    rand(seed + i * 31 + r * 7 + c) > 0.45 ? (
                      <rect key={`${r}-${c}`} x={bx + 8 + c * 26} y={y - b.bh + 12 + r * 34} width={12} height={16} fill={windows} opacity={0.8} />
                    ) : null,
                  ),
                )}
            </g>
          );
        }),
      )}
    </g>
  );
};

const Haze: React.FC<{ color: string; o?: number }> = ({ color, o = 0.28 }) => <rect width={W} height={GROUND} fill={color} opacity={o} />;

const Floor: React.FC<{ top: string; bottom: string; lines?: string }> = ({ top, bottom, lines }) => (
  <g>
    <defs>
      <linearGradient id={`floor-${top.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect y={GROUND} width={W} height={H - GROUND} fill={`url(#floor-${top.slice(1)}`} />
    {lines &&
      Array.from({ length: 13 }, (_, i) => {
        const x = -400 + i * 230;
        return <path key={i} d={`M ${W / 2 + (x - W / 2) * 0.55} ${GROUND} L ${x} ${H}`} stroke={lines} strokeWidth={3} opacity={0.35} />;
      })}
    {lines && [0.3, 0.62].map((k) => <path key={k} d={`M 0 ${GROUND + (H - GROUND) * k} L ${W} ${GROUND + (H - GROUND) * k}`} stroke={lines} strokeWidth={3} opacity={0.25} />)}
    <rect y={GROUND - 6} width={W} height={12} fill="#000" opacity={0.12} />
  </g>
);

const Gradient: React.FC<{ id: string; a: string; b: string; h?: number }> = ({ id, a, b, h = GROUND }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </linearGradient>
    </defs>
    <rect width={W} height={h} fill={`url(#${id})`} />
  </>
);

const Plant: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-50, -20, 10, 40, -35, 25].map((a, i) => (
        <ellipse key={i} cx={0} cy={-110} rx={22} ry={70} fill={i % 2 ? "#3E9A5C" : "#2F7F4A"} transform={`rotate(${a + Math.sin(f * 0.04 + i) * 2} 0 -40)`} />
      ))}
      <path d="M -45 -40 L 45 -40 L 34 0 L -34 0 Z" fill="#D9764A" />
      <rect x={-50} y={-48} width={100} height={14} rx={4} fill="#C4623A" />
    </g>
  );
};

const Lamp: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={-330} rx={170} ry={120} fill="#FFE7A3" opacity={0.25 + Math.sin(f * 0.1) * 0.02} />
      <rect x={-5} y={-330} width={10} height={330} fill="#5A554C" />
      <ellipse cx={0} cy={0} rx={50} ry={10} fill="#5A554C" />
      <path d="M -60 -320 L 60 -320 L 38 -400 L -38 -400 Z" fill="#F6C66B" />
    </g>
  );
};

const Window: React.FC<{ x: number; y: number; w: number; h: number; f: number }> = ({ x, y, w, h, f }) => (
  <g>
    <defs>
      <clipPath id={`win-${x}`}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <linearGradient id={`sky-${x}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7CC3F2" />
        <stop offset="1" stopColor="#D9F0FF" />
      </linearGradient>
    </defs>
    <g clipPath={`url(#win-${x})`}>
      <rect x={x} y={y} width={w} height={h} fill={`url(#sky-${x})`} />
      <Cloud x={x + ((f * 0.4) % (w + 300)) - 150} y={y + h * 0.3} s={0.7} />
      <g transform={`translate(${x} 0)`}>
        <Skyline y={y + h} color="#9DB4CC" seed={4} h={h * 0.55} />
      </g>
    </g>
    <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} fill="none" stroke="#FFFFFF" strokeWidth={20} />
    <path d={`M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h / 2} L ${x + w} ${y + h / 2}`} stroke="#FFFFFF" strokeWidth={12} />
    <rect x={x - 30} y={y + h + 10} width={w + 60} height={18} rx={4} fill="#E9E2D3" />
  </g>
);

export const SetBg: React.FC<{ name: SetName }> = ({ name }) => {
  const f = useCurrentFrame();
  switch (name) {
    case "room":
      return (
        <g>
          <Gradient id="room-wall" a="#F7DDB5" b="#EDC992" />
          <rect y={GROUND - 120} width={W} height={120} fill="#E3B97F" opacity={0.6} />
          <rect y={GROUND - 124} width={W} height={8} fill="#C9965C" opacity={0.6} />
          <Window x={60} y={150} w={300} h={330} f={f} />
          <g transform="translate(1720 250)">
            <rect x={-80} y={-70} width={160} height={120} rx={6} fill="#FFFFFF" />
            <rect x={-66} y={-56} width={132} height={92} fill="#8FC9A8" />
            <path d="M -66 36 L -20 -10 L 10 18 L 40 -20 L 66 36 Z" fill="#4C9A6E" />
            <circle cx={36} cy={-30} r={12} fill="#F6D36B" />
          </g>
          <Plant x={1850} y={GROUND} s={1.1} />
          <Lamp x={1700} y={GROUND} />
          <Haze color="#FFF6E6" />
          <Floor top="#C98D58" bottom="#A86E3F" lines="#7A4E2A" />
        </g>
      );
    case "kitchen":
      return (
        <g>
          <Gradient id="kit-wall" a="#E4F1EC" b="#CFE5DC" />
          {Array.from({ length: 24 }, (_, i) =>
            Array.from({ length: 4 }, (_, r) => (
              <rect key={`${i}-${r}`} x={i * 80} y={GROUND - 300 + r * 70} width={78} height={68} fill="#FFFFFF" opacity={0.35} />
            )),
          )}
          <rect x={1620} y={GROUND - 150} width={300} height={150} fill="#7DB9A5" />
          <rect x={1600} y={GROUND - 170} width={340} height={24} rx={6} fill="#E8E0CF" />
          <g transform="translate(1720 120) scale(0.75)">
            <rect x={-140} y={0} width={280} height={160} rx={10} fill="#8CC7B2" />
            <rect x={-130} y={10} width={125} height={140} rx={6} fill="#A3D6C3" />
            <rect x={5} y={10} width={125} height={140} rx={6} fill="#A3D6C3" />
          </g>
          <Plant x={120} y={GROUND - 250} s={0.6} />
          <Haze color="#F4FBF8" />
          <Floor top="#D8D2C2" bottom="#BDB5A2" lines="#8E8571" />
        </g>
      );
    case "office":
      return (
        <g>
          <Gradient id="off-wall" a="#E3EBF3" b="#CCD9E6" />
          <Window x={70} y={120} w={420} h={360} f={f} />
          <g transform="translate(640 150) scale(0.8)">
            <circle r={70} fill="#FFFFFF" stroke="#3A4A5C" strokeWidth={10} />
            <path d={`M 0 0 L 0 -45`} stroke="#3A4A5C" strokeWidth={8} strokeLinecap="round" transform={`rotate(${f * 0.5})`} />
            <path d={`M 0 0 L 32 0`} stroke="#3A4A5C" strokeWidth={8} strokeLinecap="round" />
          </g>
          <g transform="translate(1790 120)">
            {[0, 1, 2].map((r) => (
              <g key={r}>
                <rect x={-110} y={r * 120} width={220} height={12} rx={4} fill="#8A6A4F" />
                {[0, 1, 2, 3, 4].map((b) => (
                  <rect key={b} x={-100 + b * 38} y={r * 120 - 70 + (b % 2) * 10} width={30} height={70 - (b % 2) * 10} rx={4} fill={["#3B6FD8", "#E0503A", "#2E9E5B", "#F2B33D", "#8E5AD8"][(b + r) % 5]} opacity={0.85} />
                ))}
              </g>
            ))}
          </g>
          <Plant x={1850} y={GROUND} s={0.9} />
          <Haze color="#F5F8FC" />
          <Floor top="#9AA6B4" bottom="#7D8896" />
        </g>
      );
    case "street":
      return (
        <g>
          <Gradient id="street-sky" a="#7EC6F4" b="#FCE7C4" />
          <circle cx={1500} cy={220} r={90} fill="#FFE08A" opacity={0.9} />
          <Cloud x={((f * 0.5) % 2400) - 200} y={150} s={1.1} />
          <Cloud x={((f * 0.3 + 900) % 2400) - 200} y={260} s={0.8} o={0.8} />
          <Skyline y={GROUND - 10} color="#B9C8DC" seed={1} h={520} f={f} speed={0.15} />
          <Skyline y={GROUND} color="#8FA3BF" seed={7} h={380} windows="#E8EEF7" f={f} speed={0.35} />
          <Haze color="#FFF7EA" o={0.25} />
          <rect y={GROUND} width={W} height={60} fill="#C9CDD4" />
          <rect y={GROUND + 60} width={W} height={H - GROUND - 60} fill="#6F747D" />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={((i * 260 - f * 3) % 2600) - 200} y={GROUND + 150} width={120} height={14} rx={7} fill="#F2D27A" />
          ))}
          <g transform={`translate(1780 ${GROUND})`}>
            <rect x={-7} y={-420} width={14} height={420} fill="#3E4652" />
            <path d="M 0 -420 Q 0 -450 -60 -450" fill="none" stroke="#3E4652" strokeWidth={12} />
            <ellipse cx={-70} cy={-440} rx={34} ry={14} fill="#3E4652" />
            <ellipse cx={-70} cy={-425} rx={22} ry={8} fill="#FFE9A8" />
          </g>
        </g>
      );
    case "park":
      return (
        <g>
          <Gradient id="park-sky" a="#86CDF7" b="#E2F5FF" />
          <circle cx={1650} cy={180} r={80} fill="#FFE08A" />
          <Cloud x={((f * 0.4) % 2400) - 200} y={170} />
          <Cloud x={((f * 0.25 + 1100) % 2400) - 200} y={290} s={0.7} o={0.85} />
          <path d={`M 0 ${GROUND - 150} Q 400 ${GROUND - 330} 900 ${GROUND - 170} T 1920 ${GROUND - 200} L 1920 ${GROUND} L 0 ${GROUND} Z`} fill="#A8D8A0" />
          <path d={`M 0 ${GROUND - 60} Q 600 ${GROUND - 200} 1200 ${GROUND - 80} T 1920 ${GROUND - 90} L 1920 ${GROUND} L 0 ${GROUND} Z`} fill="#8CC985" />
          {[120, 1780, 1600].map((x, i) => (
            <g key={x} transform={`translate(${x} ${GROUND - (i === 2 ? 60 : 0)}) scale(${i === 2 ? 0.7 : 1})`}>
              <rect x={-14} y={-200} width={28} height={200} fill="#8A6247" />
              <circle cx={0} cy={-260} r={110} fill="#4FA36A" />
              <circle cx={-60} cy={-210} r={70} fill="#5CB477" />
              <circle cx={60} cy={-215} r={75} fill="#459660" />
            </g>
          ))}
          <Haze color="#F6FFF4" o={0.22} />
          <Floor top="#7DBB6F" bottom="#5E9C52" />
          <path d={`M 700 ${H} Q 860 ${GROUND + 60} 1000 ${GROUND}`} stroke="#E8D9B0" strokeWidth={90} fill="none" opacity={0.7} />
        </g>
      );
    case "bank":
      return (
        <g>
          <Gradient id="bank-wall" a="#EFE8DA" b="#E0D5BF" />
          {[160, 420, 1500, 1760].map((x) => (
            <g key={x}>
              <rect x={x - 45} y={140} width={90} height={GROUND - 140} fill="#F8F4EA" />
              {[0, 1, 2, 3].map((k) => (
                <rect key={k} x={x - 45 + 6 + k * 21} y={170} width={10} height={GROUND - 200} fill="#E3DAC6" />
              ))}
              <rect x={x - 60} y={120} width={120} height={30} fill="#E8DFCB" />
            </g>
          ))}
          <path d="M 0 120 L 960 20 L 1920 120 Z" fill="#E4DAC4" />
          <Haze color="#FFFBF2" />
          <Floor top="#D9CDB4" bottom="#BFB197" lines="#9C8E72" />
        </g>
      );
    case "board":
      return (
        <g>
          <Gradient id="board-wall" a="#E9E6DE" b="#DAD5C8" />
          <rect x={600} y={90} width={1250} height={680} rx={14} fill="#B8C0C8" />
          <rect x={614} y={104} width={1222} height={652} rx={8} fill="#FFFFFF" />
          <rect x={614} y={104} width={1222} height={652} rx={8} fill="#F4F7FA" opacity={0.6} />
          <rect x={800} y={770} width={850} height={18} rx={6} fill="#A9B2BC" />
          <rect x={900} y={756} width={60} height={14} rx={4} fill="#3B6FD8" />
          <rect x={980} y={756} width={60} height={14} rx={4} fill="#E0503A" />
          <Plant x={130} y={GROUND} s={0.9} />
          <Floor top="#B9A890" bottom="#9E8C73" lines="#7C6B54" />
        </g>
      );
    case "stage":
      return (
        <g>
          <Gradient id="stage-bg" a="#1D2142" b="#2F3566" h={H} />
          <defs>
            <radialGradient id="spot" cx="50%" cy="0%" r="90%">
              <stop offset="0" stopColor="#FFF4C9" stopOpacity={0.55} />
              <stop offset="1" stopColor="#FFF4C9" stopOpacity={0} />
            </radialGradient>
          </defs>
          <path d={`M 860 0 L 1060 0 L 1500 ${GROUND + 80} L 420 ${GROUND + 80} Z`} fill="url(#spot)" />
          {Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={rand(i) * W} cy={rand(i + 99) * GROUND} r={1.5 + rand(i + 7) * 2.5} fill="#FFFFFF" opacity={0.25 + 0.25 * Math.sin(f * 0.08 + i)} />
          ))}
          <ellipse cx={960} cy={GROUND + 60} rx={620} ry={70} fill="#FFF4C9" opacity={0.18} />
          <rect y={GROUND + 60} width={W} height={H} fill="#151833" opacity={0.6} />
        </g>
      );
  }
};
