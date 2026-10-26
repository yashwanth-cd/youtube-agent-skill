import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "./theme";
import { Txt } from "./ui";

const ink = { stroke: C.ink, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

type P = { x?: number; y?: number; scale?: number; rotate?: number; opacity?: number };
const G: React.FC<P & { children: React.ReactNode }> = ({ x = 0, y = 0, scale = 1, rotate = 0, opacity = 1, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
    {children}
  </g>
);

export const Coin: React.FC<P> = (p) => (
  <G {...p}>
    <circle r={26} fill={C.gold} {...ink} strokeWidth={5} />
    <circle r={17} fill="none" stroke={C.ink} strokeWidth={2.5} opacity={0.5} />
    <Txt x={0} y={2} size={30} font="display">
      $
    </Txt>
  </G>
);

export const Bill: React.FC<P & { label?: string }> = ({ label, ...p }) => (
  <G {...p}>
    <rect x={-60} y={-32} width={120} height={64} rx={8} fill={C.greenLight} {...ink} strokeWidth={5} />
    <circle r={18} fill="none" stroke={C.green} strokeWidth={4} />
    <Txt x={0} y={2} size={label ? 22 : 30} color={C.green} font="display">
      {label ?? "$"}
    </Txt>
  </G>
);

export const CashStack: React.FC<P & { n?: number }> = ({ n = 5, ...p }) => (
  <G {...p}>
    {Array.from({ length: n }, (_, i) => (
      <Bill key={i} y={-i * 12} x={(i % 2) * 6} />
    ))}
  </G>
);

export const Envelope: React.FC<P & { label?: string }> = ({ label = "PAYCHECK", ...p }) => (
  <G {...p}>
    <rect x={-110} y={-70} width={220} height={140} rx={10} fill={C.white} {...ink} />
    <path d="M -110 -70 L 0 10 L 110 -70" fill="none" {...ink} />
    <rect x={-80} y={26} width={160} height={30} rx={6} fill={C.greenLight} stroke={C.ink} strokeWidth={3} />
    <Txt x={0} y={42} size={26} color={C.green} font="display">
      {label}
    </Txt>
  </G>
);

/** A jar that fills from 0 to 1, with a label on its front. */
export const Jar: React.FC<P & { fill?: number; label: string; color?: string; w?: number; h?: number }> = ({
  fill = 0,
  label,
  color = C.gold,
  w = 150,
  h = 190,
  ...p
}) => {
  const level = Math.max(0, Math.min(1, fill));
  const top = -h + 22;
  const fh = (h - 30) * level;
  return (
    <G {...p}>
      <defs>
        <clipPath id={`jar-${label}`}>
          <rect x={-w / 2 + 6} y={top} width={w - 12} height={h - 28} rx={22} />
        </clipPath>
      </defs>
      <g clipPath={`url(#jar-${label})`}>
        <rect x={-w / 2} y={-6 - fh} width={w} height={fh + 6} fill={color} />
        {level > 0.05 &&
          Array.from({ length: Math.floor(level * 6) }, (_, i) => (
            <circle key={i} cx={-w / 3 + ((i * 37) % (w * 0.66))} cy={-12 - ((i * 29) % Math.max(10, fh - 10))} r={10} fill={C.goldLight} opacity={0.7} />
          ))}
      </g>
      <rect x={-w / 2 + 6} y={top} width={w - 12} height={h - 28} rx={22} fill={C.white} fillOpacity={0.25} {...ink} />
      <rect x={-w / 2 + 16} y={-h + 2} width={w - 32} height={24} rx={6} fill={C.inkSoft} {...ink} strokeWidth={5} />
      <rect x={-w / 2 + 10} y={-h * 0.55 - 22} width={w - 20} height={46} rx={8} fill={C.white} stroke={C.ink} strokeWidth={4} />
      <Txt x={0} y={-h * 0.55 + 2} size={label.length > 6 ? 26 : 32} font="display">
        {label}
      </Txt>
    </G>
  );
};

export const Calendar: React.FC<P & { label: string; sub?: string; color?: string }> = ({ label, sub, color = C.red, ...p }) => (
  <G {...p}>
    <rect x={-90} y={-100} width={180} height={200} rx={14} fill={C.white} {...ink} />
    <rect x={-90} y={-100} width={180} height={52} rx={14} fill={color} {...ink} />
    <circle cx={-45} cy={-104} r={9} fill={C.white} {...ink} strokeWidth={4} />
    <circle cx={45} cy={-104} r={9} fill={C.white} {...ink} strokeWidth={4} />
    <Txt x={0} y={-72} size={30} color={C.white} font="display">
      {sub ?? "DAY"}
    </Txt>
    <Txt x={0} y={22} size={label.length > 3 ? 46 : 96} font="display">
      {label}
    </Txt>
  </G>
);

export const Phone: React.FC<P & { on?: number; label?: string }> = ({ on = 0, label = "AUTO-TRANSFER", ...p }) => (
  <G {...p}>
    <rect x={-95} y={-170} width={190} height={340} rx={28} fill={C.ink} />
    <rect x={-80} y={-145} width={160} height={290} rx={16} fill={C.white} />
    {label.split("-").map((part, i, all) => (
      <Txt key={i} x={0} y={-100 + i * 34 - (all.length - 1) * 8} size={30} font="display">
        {part}
      </Txt>
    ))}
    <rect x={-50} y={-40} width={100} height={52} rx={26} fill={on > 0.5 ? C.green : C.paperDark} stroke={C.ink} strokeWidth={4} />
    <circle cx={-24 + 48 * on} cy={-14} r={21} fill={C.white} stroke={C.ink} strokeWidth={4} />
    <Txt x={0} y={60} size={40} color={on > 0.5 ? C.green : C.inkSoft} font="display">
      {on > 0.5 ? "ON" : "OFF"}
    </Txt>
  </G>
);

export const Bucket: React.FC<P & { level?: number; leak?: boolean }> = ({ level = 0.5, leak = true, ...p }) => {
  const frame = useCurrentFrame();
  return (
    <G {...p}>
      <defs>
        <clipPath id="bucket">
          <path d="M -100 -180 L 100 -180 L 78 0 L -78 0 Z" />
        </clipPath>
      </defs>
      <rect x={-110} y={-180 * level} width={220} height={190} fill={C.blue} opacity={0.75} clipPath="url(#bucket)" />
      <path d="M -100 -180 L 100 -180 L 78 0 L -78 0 Z" fill="none" {...ink} strokeWidth={8} />
      <path d="M -100 -180 Q 0 -280 100 -180" fill="none" {...ink} strokeWidth={5} />
      {leak && (
        <>
          <circle cx={0} cy={0} r={9} fill={C.ink} />
          {level > 0.02 &&
            Array.from({ length: 4 }, (_, i) => {
              const k = ((frame * 6 + i * 40) % 160) / 160;
              return <ellipse key={i} cx={Math.sin(i) * 4} cy={14 + k * 150} rx={7} ry={11} fill={C.blue} opacity={1 - k} />;
            })}
        </>
      )}
    </G>
  );
};

export const CreditCard: React.FC<P & { rate?: string; color?: string; highlight?: boolean; label?: string }> = ({
  rate,
  color = C.blue,
  highlight = false,
  label,
  ...p
}) => (
  <G {...p}>
    {highlight && <rect x={-140} y={-95} width={280} height={190} rx={26} fill={C.gold} opacity={0.5} />}
    <rect x={-120} y={-75} width={240} height={150} rx={16} fill={color} {...ink} />
    <rect x={-120} y={-45} width={240} height={30} fill={C.ink} opacity={0.75} />
    <rect x={-95} y={5} width={45} height={34} rx={6} fill={C.goldLight} stroke={C.ink} strokeWidth={3} />
    {label && (
      <Txt x={40} y={22} size={26} color={C.white} font="display">
        {label}
      </Txt>
    )}
    {rate && (
      <g transform="translate(0 112)">
        <rect x={-80} y={-26} width={160} height={52} rx={10} fill={C.white} stroke={C.ink} strokeWidth={4} />
        <Txt x={0} y={2} size={36} color={highlight ? C.red : C.ink} font="display">
          {rate}
        </Txt>
      </g>
    )}
  </G>
);

/** The interest monster: a round red blob with teeth that chomps. */
export const Monster: React.FC<P & { open?: number }> = ({ open = 0.5, ...p }) => {
  const m = 20 + open * 60;
  return (
    <G {...p}>
      <path d="M -150 40 Q -170 -170 0 -180 Q 170 -170 150 40 Q 120 90 0 90 Q -120 90 -150 40 Z" fill={C.red} {...ink} strokeWidth={8} />
      <path d="M -40 -140 L -70 -200 L -10 -160 M 40 -140 L 70 -200 L 10 -160" fill={C.red} {...ink} />
      <circle cx={-50} cy={-90} r={24} fill={C.white} {...ink} />
      <circle cx={50} cy={-90} r={24} fill={C.white} {...ink} />
      <circle cx={-44} cy={-86} r={9} fill={C.ink} />
      <circle cx={44} cy={-86} r={9} fill={C.ink} />
      <path d="M -80 -128 L -20 -110 M 80 -128 L 20 -110" {...ink} strokeWidth={8} />
      <path d={`M -95 -20 Q 0 ${-20 + m * 1.6} 95 -20 Q 0 ${-20 + m * 0.4} -95 -20 Z`} fill={C.ink} />
      {[-60, -20, 20, 60].map((tx) => (
        <path key={tx} d={`M ${tx - 14} -16 L ${tx} 6 L ${tx + 14} -16 Z`} fill={C.white} stroke={C.ink} strokeWidth={3} />
      ))}
      <Txt x={0} y={60} size={34} color={C.white} font="display">
        INTEREST
      </Txt>
    </G>
  );
};

export const Hammer: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-10} y={-20} width={20} height={170} rx={8} fill={C.gold} {...ink} />
    <rect x={-60} y={-60} width={120} height={50} rx={8} fill={C.inkSoft} {...ink} />
  </G>
);

export const Snowball: React.FC<P & { r?: number; spin?: number }> = ({ r = 40, spin = 0, ...p }) => (
  <G {...p}>
    <g transform={`rotate(${spin})`}>
      <circle r={r} fill={C.white} {...ink} />
      <path d={`M ${-r * 0.5} ${-r * 0.2} Q 0 ${-r * 0.5} ${r * 0.4} ${-r * 0.1} M ${-r * 0.3} ${r * 0.4} Q ${r * 0.1} ${r * 0.2} ${r * 0.5} ${r * 0.45}`} fill="none" stroke={C.blueLight} strokeWidth={5} strokeLinecap="round" />
    </g>
  </G>
);

export const Basket: React.FC<P & { count?: number }> = ({ count = 14, ...p }) => (
  <G {...p}>
    {Array.from({ length: count }, (_, i) => {
      const bx = -150 + (i % 7) * 50;
      const row = Math.floor(i / 7);
      const h = 50 + ((i * 37) % 60);
      const colors = [C.blue, C.red, C.green, C.gold, C.inkSoft];
      return (
        <g key={i} transform={`translate(${bx} ${-90 - row * 30})`}>
          <rect x={-20} y={-h} width={40} height={h} fill={colors[i % colors.length]} stroke={C.ink} strokeWidth={4} />
          <rect x={-10} y={-h + 10} width={8} height={8} fill={C.white} />
          <rect x={4} y={-h + 10} width={8} height={8} fill={C.white} />
        </g>
      );
    })}
    <path d="M -200 -100 L 200 -100 L 160 30 L -160 30 Z" fill={C.goldLight} {...ink} strokeWidth={8} />
    <path d="M -180 -60 L 180 -60 M -170 -20 L 170 -20" stroke={C.ink} strokeWidth={4} opacity={0.4} />
    <Txt x={0} y={-36} size={40} font="display">
      INDEX FUND
    </Txt>
  </G>
);

export const Book: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M 0 -50 Q -40 -64 -80 -50 L -80 40 Q -40 26 0 40 Q 40 26 80 40 L 80 -50 Q 40 -64 0 -50 Z" fill={C.white} {...ink} />
    <path d="M 0 -50 L 0 40" {...ink} />
    <path d="M -60 -26 L -18 -30 M -60 -6 L -18 -10 M 18 -30 L 60 -26 M 18 -10 L 60 -6" stroke={C.inkSoft} strokeWidth={3} />
  </G>
);

export const Door: React.FC<P & { label: string; color?: string; open?: number }> = ({ label, color = C.blue, open = 0, ...p }) => (
  <G {...p}>
    <rect x={-80} y={-260} width={160} height={260} fill={C.goldLight} {...ink} />
    <path d={`M -80 -260 L ${-80 + 160 * (1 - open * 0.7)} ${-260 + open * 20} L ${-80 + 160 * (1 - open * 0.7)} ${-open * 20} L -80 0 Z`} fill={color} {...ink} />
    <circle cx={-80 + 160 * (1 - open * 0.7) - 22} cy={-130} r={8} fill={C.gold} stroke={C.ink} strokeWidth={3} />
    <Txt x={0} y={-300} size={40} font="display">
      {label}
    </Txt>
  </G>
);

export const TV: React.FC<P & { w?: number; text?: string }> = ({ w = 220, text, ...p }) => (
  <G {...p}>
    <rect x={-w / 2} y={-w * 0.62} width={w} height={w * 0.58} rx={10} fill={C.ink} />
    <rect x={-w / 2 + 12} y={-w * 0.62 + 12} width={w - 24} height={w * 0.58 - 24} rx={4} fill={C.blueLight} />
    {text && (
      <Txt x={0} y={-w * 0.33} size={w * 0.11} color={C.red} font="display">
        {text}
      </Txt>
    )}
    <path d={`M -30 -${w * 0.04} L -45 0 M 30 -${w * 0.04} L 45 0`} {...ink} />
  </G>
);

export const Car: React.FC<P & { color?: string; flat?: boolean; fancy?: boolean }> = ({ color = C.red, flat = false, fancy = false, ...p }) => (
  <G {...p}>
    <path
      d={fancy ? "M -170 -40 L -150 -80 L -60 -110 L 70 -110 L 140 -70 L 175 -60 L 175 -20 L -170 -20 Z" : "M -150 -40 L -120 -100 L 60 -100 L 110 -50 L 150 -45 L 150 -20 L -150 -20 Z"}
      fill={color}
      {...ink}
    />
    <path d={fancy ? "M -40 -100 L 60 -100 L 110 -70 L -50 -70 Z" : "M -100 -90 L -10 -90 L -10 -50 L -120 -50 Z M 10 -90 L 55 -90 L 90 -50 L 10 -50 Z"} fill={C.blueLight} {...ink} strokeWidth={4} />
    <ellipse cx={-90} cy={-14} rx={32} ry={flat ? 20 : 32} fill={C.ink} />
    <ellipse cx={95} cy={-14} rx={32} ry={32} fill={C.ink} />
    <circle cx={95} cy={-14} r={12} fill={C.paperDark} />
    {!flat && <circle cx={-90} cy={-14} r={12} fill={C.paperDark} />}
  </G>
);

/** A tree whose branches carry coins. `drop` animates one coin falling. */
export const MoneyTree: React.FC<P & { grow?: number; drop?: number }> = ({ grow = 1, drop = -1, ...p }) => (
  <G {...p}>
    <path d="M -20 0 L -14 -200 Q -60 -230 -90 -260 M -14 -200 L 14 -200 L 20 0 Z M 14 -200 Q 60 -230 90 -260" fill={C.inkSoft} {...ink} />
    <g transform={`translate(0 -300) scale(${grow})`}>
      <circle cx={-80} cy={10} r={90} fill={C.green} {...ink} />
      <circle cx={80} cy={10} r={90} fill={C.green} {...ink} />
      <circle cx={0} cy={-50} r={110} fill={C.green} {...ink} />
      {[
        [-90, -10],
        [70, -20],
        [-20, -90],
        [30, 30],
        [110, 40],
        [-60, 60],
      ].map(([cx, cy], i) => (
        <Coin key={i} x={cx} y={cy} scale={0.7} />
      ))}
    </g>
    {drop >= 0 && drop <= 1 && <Coin x={30} y={-270 + drop * 260} scale={0.7} rotate={drop * 360} />}
  </G>
);

export const Clock: React.FC<P & { t?: number }> = ({ t = 0, ...p }) => (
  <G {...p}>
    <circle r={110} fill={C.white} {...ink} strokeWidth={8} />
    {Array.from({ length: 12 }, (_, i) => (
      <path key={i} d={`M 0 -92 L 0 -80`} transform={`rotate(${i * 30})`} {...ink} strokeWidth={5} />
    ))}
    <path d="M 0 0 L 0 -55" transform={`rotate(${t * 30})`} {...ink} strokeWidth={8} />
    <path d="M 0 0 L 0 -80" transform={`rotate(${t * 360})`} {...ink} strokeWidth={5} />
    <circle r={8} fill={C.ink} />
  </G>
);

export const Gear: React.FC<P & { r?: number; teeth?: number; spin?: number; color?: string; label?: string }> = ({
  r = 90,
  teeth = 10,
  spin = 0,
  color = C.paperDark,
  label,
  ...p
}) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r + 18 : r;
    const a1 = a - Math.PI / (teeth * 2) / 1.6;
    const a2 = a + Math.PI / (teeth * 2) / 1.6;
    pts.push(`${rr * Math.cos(a1)} ${rr * Math.sin(a1)}`, `${rr * Math.cos(a2)} ${rr * Math.sin(a2)}`);
  }
  return (
    <G {...p}>
      <g transform={`rotate(${spin})`}>
        <path d={`M ${pts.join(" L ")} Z`} fill={color} {...ink} />
        <circle r={r * 0.32} fill={C.paper} {...ink} />
      </g>
      {label && (
        <Txt x={0} y={4} size={r * 0.42} font="display">
          {label}
        </Txt>
      )}
    </G>
  );
};

export const Safe: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-110} y={-220} width={220} height={220} rx={14} fill={C.inkSoft} {...ink} />
    <rect x={-90} y={-200} width={180} height={180} rx={8} fill={C.paperDark} {...ink} strokeWidth={4} />
    <circle cx={0} cy={-110} r={36} fill={C.white} {...ink} />
    <path d="M 0 -110 L 0 -136 M 0 -110 L 22 -100" {...ink} strokeWidth={4} />
  </G>
);

export const Tumbleweed: React.FC<P & { spin?: number }> = ({ spin = 0, ...p }) => (
  <G {...p}>
    <g transform={`rotate(${spin})`}>
      <circle r={40} fill="none" stroke={C.inkSoft} strokeWidth={4} />
      <path d="M -36 -10 Q 0 30 34 -16 M -20 32 Q 0 -30 26 30 M -30 20 Q 10 -40 36 10 M -10 -38 Q 30 0 -8 38" fill="none" stroke={C.inkSoft} strokeWidth={4} />
    </g>
  </G>
);

export const Bathtub: React.FC<P & { running?: boolean; level?: number }> = ({ running = true, level = 0.5, ...p }) => {
  const frame = useCurrentFrame();
  return (
    <G {...p}>
      <path d="M 140 -150 L 140 -200 Q 140 -230 110 -230 L 80 -230 L 80 -215" fill="none" {...ink} strokeWidth={10} />
      {running &&
        Array.from({ length: 3 }, (_, i) => {
          const k = ((frame * 5 + i * 30) % 90) / 90;
          return <ellipse key={i} cx={80} cy={-200 + k * 120} rx={6} ry={12} fill={C.blue} />;
        })}
      <defs>
        <clipPath id="tub">
          <path d="M -170 -130 L 170 -130 Q 160 0 0 0 Q -160 0 -170 -130 Z" />
        </clipPath>
      </defs>
      <rect x={-180} y={-130 * level} width={360} height={140} fill={C.blue} opacity={0.6} clipPath="url(#tub)" />
      <path d="M -190 -130 L 190 -130 M -170 -130 Q -160 0 0 0 Q 160 0 170 -130" fill="none" {...ink} strokeWidth={8} />
      <path d="M -120 0 L -130 30 M 120 0 L 130 30" {...ink} strokeWidth={8} />
      <circle cx={-60} cy={-6} r={8} fill={C.ink} />
    </G>
  );
};

export const Pizza: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M 0 0 L -60 -110 Q 0 -140 60 -110 Z" fill={C.goldLight} {...ink} />
    <path d="M -60 -110 Q 0 -140 60 -110 L 54 -98 Q 0 -126 -54 -98 Z" fill={C.gold} stroke={C.ink} strokeWidth={4} />
    <circle cx={-14} cy={-80} r={10} fill={C.red} />
    <circle cx={16} cy={-60} r={9} fill={C.red} />
    <circle cx={0} cy={-30} r={7} fill={C.red} />
  </G>
);

export const Couch: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-220} y={-170} width={440} height={110} rx={30} fill={C.blue} {...ink} />
    <rect x={-240} y={-90} width={480} height={80} rx={20} fill={C.blue} {...ink} />
    <rect x={-260} y={-130} width={60} height={120} rx={24} fill={C.blue} {...ink} />
    <rect x={200} y={-130} width={60} height={120} rx={24} fill={C.blue} {...ink} />
    <path d="M -200 -10 L -200 10 M 200 -10 L 200 10" {...ink} strokeWidth={8} />
  </G>
);

export const Sign: React.FC<P & { text: string; color?: string; w?: number }> = ({ text, color = C.white, w, ...p }) => {
  const width = w ?? text.length * 26 + 60;
  return (
    <G {...p}>
      <path d="M 0 0 L 0 -120" {...ink} strokeWidth={10} />
      <rect x={-width / 2} y={-200} width={width} height={90} rx={10} fill={color} {...ink} />
      <Txt x={0} y={-153} size={42} font="display">
        {text}
      </Txt>
    </G>
  );
};

export const Ticket: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-110} y={-60} width={220} height={120} rx={10} fill={C.goldLight} {...ink} />
    <path d="M -60 -60 L -60 60" stroke={C.ink} strokeWidth={4} strokeDasharray="10 8" />
    <Txt x={30} y={-14} size={34} font="display">
      LOTTO
    </Txt>
    <Txt x={30} y={26} size={26} color={C.inkSoft}>
      7 · 13 · 42
    </Txt>
  </G>
);

export const Rocket: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M 0 -130 Q 50 -80 40 30 L -40 30 Q -50 -80 0 -130 Z" fill={C.white} {...ink} />
    <circle cx={0} cy={-50} r={22} fill={C.gold} {...ink} strokeWidth={4} />
    <path d="M -40 0 L -70 50 L -40 30 M 40 0 L 70 50 L 40 30" fill={C.red} {...ink} />
    <path d="M -20 36 Q 0 100 20 36 Z" fill={C.gold} stroke={C.red} strokeWidth={4} />
  </G>
);

export const Hammock: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M -260 0 L -260 -220 M 260 0 L 260 -220" {...ink} strokeWidth={12} />
    <path d="M -260 -200 Q 0 -40 260 -200" fill="none" {...ink} strokeWidth={6} />
    <path d="M -230 -180 Q 0 -70 230 -180" fill="none" stroke={C.red} strokeWidth={16} strokeLinecap="round" />
  </G>
);

export const Lemonade: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-120} y={-110} width={240} height={110} fill={C.goldLight} {...ink} />
    <path d="M -130 -110 L -130 -230 M 130 -110 L 130 -230" {...ink} strokeWidth={8} />
    <path d="M -150 -230 L 150 -230 L 130 -190 L -130 -190 Z" fill={C.red} {...ink} />
    <Txt x={0} y={-56} size={36} font="display">
      LEMONADE
    </Txt>
  </G>
);

export const Certificate: React.FC<P & { label?: string }> = ({ label = "1 SHARE", ...p }) => (
  <G {...p}>
    <rect x={-110} y={-80} width={220} height={160} rx={6} fill={C.white} {...ink} />
    <rect x={-96} y={-66} width={192} height={132} rx={4} fill="none" stroke={C.gold} strokeWidth={5} />
    <Txt x={0} y={-12} size={38} font="display">
      {label}
    </Txt>
    <circle cx={60} cy={40} r={18} fill={C.red} stroke={C.ink} strokeWidth={3} />
  </G>
);

export const Shop: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-100} y={-140} width={200} height={140} fill={C.white} {...ink} />
    <path d="M -120 -140 L 120 -140 L 100 -190 L -100 -190 Z" fill={C.green} {...ink} />
    <rect x={-30} y={-80} width={60} height={80} fill={C.goldLight} {...ink} strokeWidth={4} />
    <rect x={-85} y={-110} width={45} height={40} fill={C.blueLight} {...ink} strokeWidth={4} />
    <rect x={40} y={-110} width={45} height={40} fill={C.blueLight} {...ink} strokeWidth={4} />
  </G>
);

export const Tea: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M -22 -30 L 22 -30 L 18 10 Q 0 18 -18 10 Z" fill={C.white} {...ink} strokeWidth={5} />
    <path d="M 22 -20 Q 40 -16 20 2" fill="none" {...ink} strokeWidth={5} />
  </G>
);

export const BarChart: React.FC<P & { bars: { value: number; color: string; label: string; top?: string; under?: string }[]; max: number; h?: number; gap?: number }> = ({
  bars,
  max,
  h = 520,
  gap = 260,
  ...p
}) => (
  <G {...p}>
    <path d={`M -60 0 L ${gap * bars.length - 60} 0`} {...ink} />
    {bars.map((b, i) => {
      const bh = (b.value / max) * h;
      return (
        <g key={i} transform={`translate(${i * gap + gap / 2 - 60} 0)`}>
          <rect x={-70} y={-bh} width={140} height={bh} rx={8} fill={b.color} {...ink} />
          {b.top && bh > 4 && (
            <Txt x={0} y={-bh - 40} size={52} font="display">
              {b.top}
            </Txt>
          )}
          <Txt x={0} y={44} size={40} font="display">
            {b.label}
          </Txt>
          {b.under && (
            <Txt x={0} y={90} size={34} color={C.inkSoft}>
              {b.under}
            </Txt>
          )}
        </g>
      );
    })}
  </G>
);

export const Shark: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M -50 0 L 0 -120 L 50 0 Z" fill={C.inkSoft} {...ink} />
  </G>
);
