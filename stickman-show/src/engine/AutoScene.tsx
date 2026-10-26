import React from "react";
import { Sequence, useCurrentFrame } from "remotion";
import { Line, SceneTiming, ease, lerp, pop, speaking } from "./anim";
import { CamKey } from "./camera";
import { Cue, Scene } from "./common";
import { Burst, Icon } from "./Icon";
import { ICONS } from "./icons.generated";
import * as P from "./props";
import { DARK_SETS, SetName } from "./sets";
import { Emote, Expr, POSES, PoseKey, PoseName, Stick, poseAt, waving } from "./Stick";
import { C, GROUND, H, NIGHT, W } from "./theme";
import { Arrow, CrossOut, Stamp, Txt } from "./ui";

/**
 * Scenes declared in script.json instead of code. Each line can carry:
 *   "beat"    what appears on screen (stays up until the next line with a beat)
 *   "pose", "expr", "emote", "holding"   what Stick does
 *   "camera"  "wide" | "stick" | "content" | "close" - how the shot is framed for this line
 *   "burst"   "confetti" | "coins" | "sparkle" - particles at the start of the line
 * The catalogue for writers is .claude/skills/stickman-video/beats.md - keep the two in sync.
 */

type Item = string | { text: string; icon?: string };
type Side = { title: string; items?: Item[]; color?: string; icon?: string; prop?: string };

export type Beat =
  | { type: "title"; n?: number; title: string; sub?: string; color?: string; icon?: string }
  | { type: "text"; text: string; sub?: string; color?: string; icon?: string }
  | { type: "icon"; icon?: string; icons?: string[]; label?: string; sub?: string }
  | { type: "cards"; items: { icon?: string; title: string; text?: string; color?: string }[] }
  | { type: "chart"; title?: string; x: string[]; series: { label: string; values: (number | null)[]; color?: string }[]; unit?: string; prefix?: string; note?: string }
  | { type: "counter"; to: number; from?: number; prefix?: string; suffix?: string; label?: string; note?: string; icon?: string; decimals?: number; color?: string }
  | { type: "donut"; segments: { label: string; value: number; color?: string; icon?: string }[]; center?: string; title?: string }
  | { type: "grid"; icon: string; count: number; highlight: number; highlightIcon?: string; label?: string }
  | { type: "timeline"; points: { label: string; text?: string; icon?: string }[]; title?: string }
  | { type: "tags"; items: Item[]; colors?: string[] }
  | { type: "list"; title?: string; items: Item[] }
  | { type: "steps"; items: Item[] }
  | { type: "stamp"; text: string; color?: string }
  | { type: "bars"; title?: string; bars: { label: string; value: number; top?: string; under?: string; color?: string; icon?: string }[]; note?: string }
  | { type: "jars"; jars: { label: string; fill: number; color?: string }[]; coins?: boolean }
  | { type: "compare"; left: Side; right: Side }
  | { type: "flow"; items: Item[] }
  | { type: "prop"; name: string; label?: string; args?: Record<string, unknown> }
  | { type: "props"; items: { name: string; label?: string }[] }
  | { type: "cross"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "cast"; who: CastName; label?: string; expr?: Expr; pose?: PoseName; emote?: Emote }
  | { type: "clear" };

export type CameraMode = "wide" | "stick" | "content" | "close";
export type ScriptLine = {
  key: string;
  text: string;
  screen?: string;
  pose?: PoseName | "wave";
  expr?: Expr;
  emote?: Emote;
  holding?: string;
  camera?: CameraMode;
  burst?: "confetti" | "coins" | "sparkle";
  beat?: Beat;
};
export type ScriptScene = { id: string; chapter: string; set?: SetName; stickX?: number; lines: ScriptLine[] };
export type Script = { scenes: ScriptScene[] };

const COLOR: Record<string, string> = { green: C.green, red: C.red, blue: C.blue, gold: C.gold, ink: C.ink, purple: "#8E5AD8" };
const LIGHT: Record<string, string> = { green: C.greenLight, red: C.redLight, blue: C.blueLight, gold: C.goldLight, ink: C.white, purple: "#E3D4F7" };
const col = (c: string | undefined, fallback: string) => (c ? (COLOR[c] ?? c) : fallback);
const light = (c: string | undefined, fallback: string) => (c ? (LIGHT[c] ?? c) : fallback);
const CYCLE = ["green", "blue", "gold", "red", "purple"];
const itemText = (i: Item) => (typeof i === "string" ? i : i.text);
const itemIcon = (i: Item) => (typeof i === "string" ? undefined : i.icon);
const isIcon = (name: string) => name in ICONS;

// ---- hand-drawn props (older beats); any Fluent icon name works too -----------------------------

type PropDef = { C: React.FC<Record<string, unknown>>; ground: boolean; scale: number };
const prop = (Comp: unknown, ground: boolean, scale: number): PropDef => ({ C: Comp as PropDef["C"], ground, scale });
const PROPS: Record<string, PropDef> = {
  jar: prop(P.Jar, true, 1.4),
  bucket: prop(P.Bucket, true, 1.3),
  car: prop(P.Car, true, 1.4),
  moneyTree: prop(P.MoneyTree, true, 0.95),
  safe: prop(P.Safe, true, 1.4),
  basket: prop(P.Basket, true, 1.3),
  hammock: prop(P.Hammock, true, 1),
  phone: prop(P.Phone, false, 1),
  card: prop(P.CreditCard, false, 1.4),
  monster: prop(P.Monster, false, 1.2),
  bathtub: prop(P.Bathtub, true, 1.3),
  lemonade: prop(P.Lemonade, true, 1.2),
  snowball: prop(P.Snowball, false, 2.2),
};
export const PROP_NAMES = Object.keys(PROPS);

const Thing: React.FC<{ name: string; x: number; y?: number; size?: number; args?: Record<string, unknown>; seed?: number }> = ({ name, x, y, size = 1, args, seed = 0 }) => {
  if (isIcon(name)) return <Icon name={name} x={x} y={y ?? 470} size={300 * size} float seed={seed} />;
  const def = PROPS[name];
  if (!def) throw new Error(`"${name}" is neither a Fluent icon nor a drawn prop (${PROP_NAMES.join(", ")}). Search icons: npm run icons -- search <word>`);
  return <def.C x={x} y={y ?? (def.ground ? GROUND : 470)} scale={def.scale * size} {...args} />;
};

// ---- the supporting cast -----------------------------------------------------------------------

export type CastName = "larry" | "boss" | "shady" | "friend";
const CAST: Record<CastName, { color: string; accessory: "glasses" | "tie" | "shades" | "cap"; seed: number; tag: string }> = {
  larry: { color: C.blue, accessory: "glasses", seed: 5, tag: "blue" },
  boss: { color: C.ink, accessory: "tie", seed: 9, tag: "red" },
  shady: { color: C.inkSoft, accessory: "shades", seed: 11, tag: "gold" },
  friend: { color: C.green, accessory: "cap", seed: 7, tag: "green" },
};

// ---- building blocks ---------------------------------------------------------------------------

const CX = 1210;
const spread = (i: number, n: number, len: number) => Math.round((i * Math.max(0, len - 30)) / Math.max(1, n));

const Popper: React.FC<{ f: number; at: number; x: number; y: number; children: React.ReactNode; rotate?: number }> = ({ f, at, x, y, children, rotate = 0 }) => {
  if (f < at) return null;
  const s = pop(f, at);
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.max(0, s)}) rotate(${rotate})`} opacity={Math.min(1, s * 2)}>
      {children}
    </g>
  );
};

/** A white card with a soft shadow, centred on (x, y). */
const Card: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; children?: React.ReactNode; accent?: string }> = ({ x, y, w, h, fill = C.white, children, accent }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={28} fill="#000" opacity={0.12} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={fill} stroke={C.ink} strokeWidth={5} />
    {accent && <rect x={-w / 2} y={-h / 2} width={w} height={18} rx={9} fill={accent} />}
    {children}
  </g>
);

/** A rounded label chip, optionally with an icon on its left. */
const Chip: React.FC<{ text: string; icon?: string; fill?: string; size?: number; font?: "bold" | "display" }> = ({ text, icon, fill = C.white, size = 46, font = "bold" }) => {
  const iconW = icon ? size * 1.3 : 0;
  const w = text.length * size * (font === "display" ? 0.62 : 0.54) + size * 1.2 + iconW;
  const h = size * 1.7;
  return (
    <g>
      <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={h / 2} fill="#000" opacity={0.13} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke={C.ink} strokeWidth={5} />
      {icon && <Icon name={icon} x={-w / 2 + size * 0.55 + iconW / 2} y={0} size={size * 1.25} shadow={false} />}
      <Txt x={iconW / 2} y={size * 0.08} size={size} font={font}>
        {text}
      </Txt>
    </g>
  );
};

const fmt = (v: number, decimals = 0) => v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Draws one beat. `f` is frames since the beat started, `len` the spoken length of its line. */
const BeatView: React.FC<{ beat: Beat; f: number; len: number; dark: boolean }> = ({ beat, f, len, dark }) => {
  const ink = dark ? C.white : C.ink;
  switch (beat.type) {
    case "title":
    case "cast":
    case "clear":
      return null;

    case "text":
      return (
        <Popper f={f} at={0} x={CX} y={beat.icon ? 470 : 420}>
          {beat.icon && <Icon name={beat.icon} x={0} y={-230} size={200} float />}
          <Txt x={0} y={0} size={beat.text.length > 20 ? 86 : 116} font="display" color={col(beat.color, ink)}>
            {beat.text}
          </Txt>
          {beat.sub && (
            <Txt x={0} y={100} size={50} font="bold" color={dark ? C.goldLight : C.inkSoft}>
              {beat.sub}
            </Txt>
          )}
        </Popper>
      );

    case "icon": {
      const icons = beat.icons ?? (beat.icon ? [beat.icon] : []);
      const n = icons.length;
      const size = n === 1 ? 380 : n === 2 ? 290 : 230;
      const gap = Math.min(380, 1000 / Math.max(1, n));
      return (
        <>
          {icons.map((ic, i) => (
            <Popper key={i} f={f} at={spread(i, n, len)} x={CX + (i - (n - 1) / 2) * gap} y={beat.label ? 400 : 450}>
              <Icon name={ic} x={0} y={0} size={size} float seed={i} />
            </Popper>
          ))}
          {beat.label && (
            <Popper f={f} at={10} x={CX} y={680}>
              <Chip text={beat.label} font="display" size={50} fill={C.goldLight} />
            </Popper>
          )}
          {beat.sub && (
            <Txt x={CX} y={775} size={42} font="bold" color={dark ? C.goldLight : C.inkSoft} opacity={ease(f, 18, 10)}>
              {beat.sub}
            </Txt>
          )}
        </>
      );
    }

    case "cards": {
      const n = beat.items.length;
      const w = n <= 2 ? 460 : n === 3 ? 340 : 270;
      const gap = w + 40;
      return (
        <>
          {beat.items.map((c, i) => (
            <Popper key={i} f={f} at={spread(i, n, len)} x={CX + (i - (n - 1) / 2) * gap} y={440}>
              <Card x={0} y={0} w={w} h={470} accent={col(c.color ?? CYCLE[i % 5], C.green)}>
                {c.icon && <Icon name={c.icon} x={0} y={-90} size={180} float seed={i} shadow={false} />}
                <Txt x={0} y={60} size={c.title.length > 12 ? 40 : 50} font="display">
                  {c.title}
                </Txt>
                {c.text &&
                  wrap(c.text, n >= 3 ? 16 : 22).map((ln, k) => (
                    <Txt key={k} x={0} y={120 + k * 44} size={36} font="bold" color={C.inkSoft} weight={600}>
                      {ln}
                    </Txt>
                  ))}
              </Card>
            </Popper>
          ))}
        </>
      );
    }

    case "chart": {
      const x0 = 720;
      const x1 = 1760;
      const y0 = 700;
      const y1 = 230;
      const all = beat.series.flatMap((s) => s.values.filter((v): v is number => v !== null));
      const max = niceMax(Math.max(...all));
      const nx = beat.x.length;
      const px = (i: number) => x0 + (i / Math.max(1, nx - 1)) * (x1 - x0);
      const py = (v: number) => y0 - (v / max) * (y0 - y1);
      const draw = ease(f, 10, Math.max(30, len - 20), (q) => q);
      const pre = beat.prefix ?? "";
      const unit = beat.unit ?? "";
      return (
        <g opacity={ease(f, 0, 10)}>
          <Card x={(x0 + x1) / 2 - 20} y={(y0 + y1) / 2 - 10} w={x1 - x0 + 200} h={y0 - y1 + 240} />
          {beat.title && (
            <Txt x={(x0 + x1) / 2} y={y1 - 70} size={46} font="display">
              {beat.title}
            </Txt>
          )}
          {[0, 0.25, 0.5, 0.75, 1].map((k) => (
            <g key={k}>
              <path d={`M ${x0} ${py(max * k)} L ${x1} ${py(max * k)}`} stroke={C.inkSoft} strokeWidth={2} opacity={0.25} />
              <Txt x={x0 - 20} y={py(max * k)} size={28} font="bold" anchor="end" color={C.inkSoft} weight={600}>
                {`${pre}${fmt(max * k)}${unit}`}
              </Txt>
            </g>
          ))}
          {beat.x.map((lab, i) => (
            <Txt key={i} x={px(i)} y={y0 + 40} size={30} font="bold" color={C.inkSoft} weight={600}>
              {lab}
            </Txt>
          ))}
          {beat.series.map((s, si) => {
            const pts = s.values.map((v, i) => (v === null ? null : ([px(i), py(v)] as [number, number]))).filter((p): p is [number, number] => p !== null);
            if (pts.length < 2) return null;
            const firstX = pts[0][0];
            const reveal = x0 + draw * (x1 - x0);
            const color = col(s.color ?? CYCLE[si % 5], C.green);
            const d = smooth(pts);
            const last = pts[pts.length - 1];
            const shownIdx = s.values.reduce<number>((acc, v, i) => (v !== null && px(i) <= reveal ? i : acc), -1);
            const shownVal = shownIdx >= 0 ? s.values[shownIdx] : null;
            return (
              <g key={si}>
                <defs>
                  <clipPath id={`reveal-${si}`}>
                    <rect x={firstX - 10} y={0} width={Math.max(0, reveal - firstX + 10)} height={H} />
                  </clipPath>
                  <linearGradient id={`area-${si}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={color} stopOpacity={0.35} />
                    <stop offset="1" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <g clipPath={`url(#reveal-${si})`}>
                  <path d={`${d} L ${last[0]} ${y0} L ${firstX} ${y0} Z`} fill={`url(#area-${si})`} />
                  <path d={d} stroke={color} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                {shownIdx >= 0 && shownVal !== null && reveal >= firstX && (
                  <g transform={`translate(${Math.min(reveal, last[0])} ${interpY(pts, Math.min(reveal, last[0]))})`}>
                    <circle r={14} fill={color} stroke={C.white} strokeWidth={5} />
                    <g transform="translate(0 -56)">
                      <Chip text={`${s.label} ${pre}${fmt(interpV(s.values, px, Math.min(reveal, last[0])))}${unit}`} fill={light(s.color ?? CYCLE[si % 5], C.white)} size={30} />
                    </g>
                  </g>
                )}
              </g>
            );
          })}
          {beat.note && (
            <Txt x={(x0 + x1) / 2} y={y0 + 95} size={28} font="bold" color={C.inkSoft} weight={600}>
              {beat.note}
            </Txt>
          )}
        </g>
      );
    }

    case "counter": {
      const t = ease(f, 6, Math.max(20, len * 0.7), (q) => 1 - Math.pow(1 - q, 3));
      const v = lerp(beat.from ?? 0, beat.to, t);
      return (
        <Popper f={f} at={2} x={CX} y={460}>
          {beat.icon && <Icon name={beat.icon} x={0} y={-220} size={200} float />}
          <Txt x={0} y={0} size={150} font="display" color={col(beat.color, dark ? C.gold : C.green)}>
            {`${beat.prefix ?? ""}${fmt(v, beat.decimals ?? 0)}${beat.suffix ?? ""}`}
          </Txt>
          {beat.label && (
            <Txt x={0} y={110} size={52} font="bold" color={dark ? C.white : C.inkSoft}>
              {beat.label}
            </Txt>
          )}
          {beat.note && (
            <g transform="translate(0 190)">
              <Chip text={beat.note} size={30} fill={C.goldLight} />
            </g>
          )}
        </Popper>
      );
    }

    case "donut": {
      const total = beat.segments.reduce((a, s) => a + s.value, 0);
      const r = 200;
      const cx = CX - 230;
      const cy = 450;
      let acc = 0;
      return (
        <g>
          {beat.title && (
            <Txt x={CX} y={160} size={52} font="display" color={ink} opacity={ease(f, 0, 10)}>
              {beat.title}
            </Txt>
          )}
          <circle cx={cx + 8} cy={cy + 12} r={r + 40} fill="#000" opacity={0.1} />
          <circle cx={cx} cy={cy} r={r + 40} fill={C.white} stroke={C.ink} strokeWidth={5} />
          {beat.segments.map((s, i) => {
            const at = spread(i, beat.segments.length, len);
            const k = ease(f, at, 22);
            const a0 = (acc / total) * 360;
            acc += s.value;
            const a1 = a0 + (s.value / total) * 360 * k;
            const color = col(s.color ?? CYCLE[i % 5], C.green);
            return (
              <g key={i}>
                {k > 0 && <path d={arc(cx, cy, r, a0, a1)} stroke={color} strokeWidth={70} fill="none" />}
                <Popper f={f} at={at + 6} x={CX + 140} y={300 + i * 110}>
                  <rect x={-30} y={-30} width={60} height={60} rx={14} fill={color} stroke={C.ink} strokeWidth={4} />
                  {s.icon && <Icon name={s.icon} x={0} y={0} size={44} shadow={false} />}
                  <Txt x={50} y={4} size={46} font="bold" anchor="start" color={ink}>
                    {`${s.label} ${Math.round((s.value / total) * 100)}%`}
                  </Txt>
                </Popper>
              </g>
            );
          })}
          {beat.center && (
            <Txt x={cx} y={cy + 6} size={beat.center.length > 6 ? 48 : 64} font="display">
              {beat.center}
            </Txt>
          )}
        </g>
      );
    }

    case "grid": {
      const n = beat.count;
      const cols = n <= 10 ? Math.min(n, 5) : 10;
      const rows = Math.ceil(n / cols);
      const size = n <= 10 ? 150 : 80;
      const gap = size * 1.15;
      return (
        <>
          {Array.from({ length: n }, (_, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            const hl = i < beat.highlight;
            const at = 4 + i * Math.max(1, Math.floor((len * 0.5) / n));
            const lit = f >= at + 10 + (hl ? len * 0.35 : 0);
            return (
              <Popper key={i} f={f} at={at} x={CX + (c - (cols - 1) / 2) * gap} y={430 + (r - (rows - 1) / 2) * gap}>
                <g opacity={hl && lit ? 1 : 0.32}>
                  <Icon name={hl && lit && beat.highlightIcon ? beat.highlightIcon : beat.icon} x={0} y={0} size={size} shadow={false} />
                </g>
                {hl && lit && <circle r={size * 0.62} fill="none" stroke={C.gold} strokeWidth={6} />}
              </Popper>
            );
          })}
          {beat.label && (
            <Popper f={f} at={Math.round(len * 0.4)} x={CX} y={430 + (rows / 2) * gap + 70}>
              <Chip text={beat.label} font="display" size={52} fill={C.goldLight} />
            </Popper>
          )}
        </>
      );
    }

    case "timeline": {
      const n = beat.points.length;
      const xa = 720;
      const xb = 1720;
      const y = 470;
      const prog = ease(f, 4, Math.max(20, len - 20), (q) => q);
      return (
        <g>
          {beat.title && (
            <Txt x={CX} y={200} size={52} font="display" color={ink} opacity={ease(f, 0, 10)}>
              {beat.title}
            </Txt>
          )}
          <path d={`M ${xa} ${y} L ${xb} ${y}`} stroke={C.paperDark} strokeWidth={14} strokeLinecap="round" />
          <path d={`M ${xa} ${y} L ${lerp(xa, xb, prog)} ${y}`} stroke={C.green} strokeWidth={14} strokeLinecap="round" />
          {beat.points.map((p, i) => {
            const x = lerp(xa, xb, n === 1 ? 0.5 : i / (n - 1));
            const at = spread(i, n, len);
            return (
              <Popper key={i} f={f} at={at} x={x} y={y}>
                <circle r={24} fill={C.white} stroke={C.ink} strokeWidth={6} />
                <circle r={11} fill={col(CYCLE[i % 5], C.green)} />
                {p.icon && <Icon name={p.icon} x={0} y={-120} size={120} float seed={i} />}
                <Txt x={0} y={64} size={44} font="display" color={ink}>
                  {p.label}
                </Txt>
                {p.text && (
                  <Txt x={0} y={112} size={34} font="bold" color={dark ? C.goldLight : C.inkSoft} weight={600}>
                    {p.text}
                  </Txt>
                )}
              </Popper>
            );
          })}
        </g>
      );
    }

    case "tags": {
      const n = beat.items.length;
      return (
        <>
          {beat.items.map((t, i) => (
            <Popper key={i} f={f} at={spread(i, n, len)} x={CX + (n > 2 ? (i % 2 ? 190 : -190) : 0)} y={270 + i * (n > 4 ? 105 : 135)} rotate={i % 2 ? 2 : -2}>
              <Chip text={itemText(t)} icon={itemIcon(t)} fill={light(beat.colors?.[i] ?? CYCLE[i % 5], C.white)} size={48} />
            </Popper>
          ))}
        </>
      );
    }

    case "list":
      return (
        <g>
          <Card x={CX} y={460} w={1000} h={130 + beat.items.length * 100 + (beat.title ? 70 : 0)} />
          {beat.title && (
            <Popper f={f} at={2} x={CX} y={460 - (beat.items.length * 100) / 2 - 20}>
              <Txt x={0} y={0} size={58} font="display">
                {beat.title}
              </Txt>
            </Popper>
          )}
          {beat.items.map((t, i) => (
            <Popper key={i} f={f} at={spread(i, beat.items.length, len)} x={CX - 400} y={460 - ((beat.items.length - 1) * 100) / 2 + i * 100 + (beat.title ? 50 : 0)}>
              {itemIcon(t) ? (
                <Icon name={itemIcon(t)!} x={10} y={0} size={70} shadow={false} />
              ) : (
                <path d="M -12 0 L 4 16 L 34 -18" stroke={C.green} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              )}
              <Txt x={70} y={4} size={52} font="bold" anchor="start">
                {itemText(t)}
              </Txt>
            </Popper>
          ))}
        </g>
      );

    case "steps":
      return (
        <>
          {beat.items.map((t, i) => {
            const n = beat.items.length;
            const x = CX + (i - (n - 1) / 2) * Math.min(250, 1050 / n);
            const icon = itemIcon(t);
            return (
              <Popper key={i} f={f} at={spread(i, n, len)} x={x} y={400}>
                <circle r={84} fill="#000" opacity={0.12} cx={6} cy={10} />
                <circle r={84} fill={col(CYCLE[i % 5], C.green)} stroke={C.ink} strokeWidth={7} />
                {icon ? <Icon name={icon} x={0} y={0} size={100} shadow={false} /> : <Txt x={0} y={8} size={86} color={C.white} font="display">{i + 1}</Txt>}
                <Txt x={0} y={140} size={36} font="display" color={ink}>
                  {itemText(t)}
                </Txt>
              </Popper>
            );
          })}
        </>
      );

    case "stamp":
      return <Stamp at={2} x={CX} y={360} text={beat.text} color={col(beat.color, C.red)} size={beat.text.length > 16 ? 64 : 84} />;

    case "bars": {
      const max = Math.max(...beat.bars.map((b) => b.value));
      const n = beat.bars.length;
      const gap = Math.min(320, 1000 / n);
      const base = GROUND - 90;
      return (
        <>
          <Card x={CX} y={(base + 150) / 2 + 40} w={Math.max(700, gap * n + 160)} h={base - 150 + 220} />
          {beat.title && (
            <Txt x={CX} y={175} size={50} font="display" opacity={ease(f, 2, 10)}>
              {beat.title}
            </Txt>
          )}
          <path d={`M ${CX - (gap * n) / 2} ${base} L ${CX + (gap * n) / 2} ${base}`} stroke={C.ink} strokeWidth={6} />
          {beat.bars.map((b, i) => {
            const at = spread(i, n, len);
            const g = ease(f, at, 30);
            const h = (b.value / max) * 380 * g;
            const x = CX + (i - (n - 1) / 2) * gap;
            return (
              <g key={i}>
                <rect x={x - 70} y={base - h} width={140} height={h} rx={12} fill={col(b.color ?? CYCLE[i % 5], C.green)} stroke={C.ink} strokeWidth={6} />
                {b.icon && g > 0.3 && <Icon name={b.icon} x={x} y={base - h - (b.top ? 120 : 60)} size={90} shadow={false} />}
                {b.top && g > 0.95 && (
                  <Txt x={x} y={base - h - 36} size={48} font="display">
                    {b.top}
                  </Txt>
                )}
                <Txt x={x} y={base + 42} size={38} font="display" opacity={ease(f, at, 8)}>
                  {b.label}
                </Txt>
                {b.under && (
                  <Txt x={x} y={base + 84} size={30} font="bold" color={C.inkSoft} weight={600} opacity={ease(f, at + 20, 8)}>
                    {b.under}
                  </Txt>
                )}
              </g>
            );
          })}
          {beat.note && (
            <Txt x={CX} y={base + 125} size={28} font="bold" color={C.inkSoft} weight={600}>
              {beat.note}
            </Txt>
          )}
        </>
      );
    }

    case "jars": {
      const n = beat.jars.length;
      const gap = Math.min(270, 1050 / n);
      return (
        <>
          {beat.jars.map((j, i) => {
            const at = spread(i, n, len);
            const x = CX + (i - (n - 1) / 2) * gap;
            return (
              <g key={i}>
                <Popper f={f} at={at} x={x} y={GROUND}>
                  <P.Jar label={j.label} fill={j.fill * ease(f, at + 12, 25)} color={col(j.color ?? CYCLE[i % 5], C.gold)} scale={1.35} />
                </Popper>
                {beat.coins &&
                  [0, 1, 2].map((k) => {
                    const t = ease(f, at + k * 5, 18, (x) => x);
                    if (t <= 0 || t >= 1) return null;
                    return <Icon key={k} name="coin" x={lerp(560, x, t)} y={lerp(560, GROUND - 270, t) - Math.sin(Math.PI * t) * 170} size={60} rotate={t * 540} shadow={false} />;
                  })}
              </g>
            );
          })}
        </>
      );
    }

    case "compare":
      return (
        <>
          {[beat.left, beat.right].map((s, i) => {
            const x = CX + (i ? 270 : -270);
            const at = i ? Math.round(len * 0.45) : 4;
            const accent = col(s.color ?? (i ? "green" : "red"), C.green);
            return (
              <Popper key={i} f={f} at={at} x={x} y={450}>
                <Card x={0} y={0} w={480} h={560} accent={accent}>
                  <Txt x={0} y={-200} size={44} font="display">
                    {s.title}
                  </Txt>
                  {s.icon && <Icon name={s.icon} x={0} y={-50} size={200} float seed={i} shadow={false} />}
                  {s.prop && !s.icon && <Thing name={s.prop} x={0} y={-50} size={0.6} />}
                  {(s.items ?? []).map((t, k) => (
                    <Txt key={k} x={0} y={(s.icon || s.prop ? 110 : -100) + k * 58} size={40} font="bold" color={C.inkSoft} weight={600}>
                      {itemText(t)}
                    </Txt>
                  ))}
                </Card>
              </Popper>
            );
          })}
          <Popper f={f} at={Math.round(len * 0.45) - 4} x={CX} y={450}>
            <circle r={46} fill={NIGHT} />
            <Txt x={0} y={4} size={40} font="display" color={C.white}>
              VS
            </Txt>
          </Popper>
        </>
      );

    case "flow": {
      const n = beat.items.length;
      const gap = Math.min(380, 1100 / n);
      const xs = beat.items.map((_, i) => CX + (i - (n - 1) / 2) * gap);
      return (
        <>
          {beat.items.map((t, i) => {
            const icon = itemIcon(t);
            return (
              <Popper key={i} f={f} at={spread(i, n, len)} x={xs[i]} y={430}>
                {icon && <Icon name={icon} x={0} y={-130} size={150} float seed={i} />}
                <Chip text={itemText(t)} fill={light(CYCLE[i % 5], C.white)} size={42} />
              </Popper>
            );
          })}
          {xs.slice(1).map((x, i) => (
            <Arrow key={i} at={spread(i + 1, n, len) - 6} x1={xs[i] + 60} y1={500} x2={x - 60} y2={500} bend={-40} color={ink} />
          ))}
        </>
      );
    }

    case "prop":
      return (
        <Popper f={f} at={0} x={0} y={0}>
          <Thing name={beat.name} x={CX} args={beat.args} />
          {beat.label && (
            <g transform={`translate(${CX} 180)`}>
              <Chip text={beat.label} font="display" size={50} fill={C.goldLight} />
            </g>
          )}
        </Popper>
      );

    case "props": {
      const n = beat.items.length;
      const gap = Math.min(380, 1100 / n);
      return (
        <>
          {beat.items.map((it, i) => {
            const x = CX + (i - (n - 1) / 2) * gap;
            return (
              <Popper key={i} f={f} at={spread(i, n, len)} x={0} y={0}>
                <Thing name={it.name} x={x} y={isIcon(it.name) ? 440 : undefined} size={n > 2 ? 0.75 : 0.9} seed={i} />
                {it.label && (
                  <g transform={`translate(${x} 660)`}>
                    <Chip text={it.label} size={40} />
                  </g>
                )}
              </Popper>
            );
          })}
        </>
      );
    }

    case "cross": {
      const n = beat.items.length;
      const gap = Math.min(340, 1100 / n);
      return (
        <>
          {beat.items.map((t, i) => {
            const x = CX + (i - (n - 1) / 2) * gap;
            const at = spread(i, n, len);
            return (
              <g key={i}>
                <Popper f={f} at={at} x={0} y={0}>
                  {isIcon(t) ? <Icon name={t} x={x} y={430} size={200} /> : t in PROPS ? <Thing name={t} x={x} y={430} size={0.7} /> : <g transform={`translate(${x} 430)`}><Chip text={t} size={44} /></g>}
                </Popper>
                <CrossOut at={at + 18} x={x} y={430} size={100} />
              </g>
            );
          })}
        </>
      );
    }

    case "quote":
      return (
        <Popper f={f} at={0} x={CX - 80} y={330}>
          <ellipse rx={440} ry={160} fill={C.white} stroke={C.ink} strokeWidth={6} />
          <path d="M -320 95 L -460 210 L -250 128" fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          {wrap(beat.text, 22).map((ln, k, all) => (
            <Txt key={k} x={0} y={(k - (all.length - 1) / 2) * 64} size={beat.text.length > 30 ? 50 : 62} font="display">
              {ln}
            </Txt>
          ))}
        </Popper>
      );
  }
};

/** Section card on the night stage: number badge, title, subtitle, Stick in the spotlight. */
const TitleStage: React.FC<{ beat: Extract<Beat, { type: "title" }>; f: number; end: number }> = ({ beat, f, end }) => {
  if (f > end + 16) return null;
  const s = pop(f, 4);
  const t = ease(f, 10, 16);
  const out = ease(f, end, 16);
  const color = col(beat.color, C.green);
  return (
    <g transform={`translate(${-out * (W + 100)} 0)`}>
      <rect width={W} height={H} fill={NIGHT} />
      <defs>
        <radialGradient id="title-spot" cx="50%" cy="35%" r="60%">
          <stop offset="0" stopColor={color} stopOpacity={0.45} />
          <stop offset="1" stopColor={NIGHT} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#title-spot)" />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={-200 + i * 160 + ((f * 2) % 160)} y={0} width={60} height={H} fill="#FFFFFF" opacity={0.03} transform={`skewX(-20)`} />
      ))}
      {beat.n !== undefined && (
        <g transform={`translate(${W / 2} 330) scale(${Math.max(0, s)}) rotate(${(1 - Math.min(1, s)) * -40})`}>
          <circle r={170} fill={color} opacity={0.25} />
          <circle r={140} fill={color} stroke={C.white} strokeWidth={10} />
          <Txt x={0} y={14} size={190} color={C.white} font="display">
            {beat.n}
          </Txt>
        </g>
      )}
      {beat.icon && <Icon name={beat.icon} x={W / 2 + 260} y={250} size={170} float rotate={12} />}
      <g transform={`translate(0 ${(1 - t) * 60})`} opacity={t}>
        <Txt x={W / 2} y={beat.n !== undefined ? 620 : 470} size={124} font="display" color={C.white}>
          {beat.title}
        </Txt>
        {beat.sub && (
          <Txt x={W / 2} y={beat.n !== undefined ? 730 : 580} size={56} font="bold" color={C.gold}>
            {beat.sub}
          </Txt>
        )}
      </g>
    </g>
  );
};

/** The channel's end card: room on the right for YouTube's end-screen elements. */
export const EndCard: React.FC<{ f: number; dark?: boolean }> = ({ f, dark = false }) => (
  <g opacity={ease(f, 0, 15)}>
    <Txt x={1220} y={170} size={80} font="display" color={dark ? C.white : C.ink}>
      THANKS FOR WATCHING
    </Txt>
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={760 + i * 500} y={300} width={440} height={248} rx={22} fill={C.white} stroke={C.ink} strokeWidth={5} strokeDasharray="16 12" />
        <Txt x={980 + i * 500} y={424} size={40} font="bold" color={C.inkSoft}>
          {i === 0 ? "watch next" : "best for you"}
        </Txt>
      </g>
    ))}
    <Popper f={f} at={15} x={1220} y={680}>
      <rect x={-210} y={-55} width={420} height={110} rx={55} fill={C.red} stroke={C.ink} strokeWidth={6} />
      <Txt x={0} y={4} size={54} font="display" color={C.white}>
        SUBSCRIBE
      </Txt>
    </Popper>
  </g>
);

const BEAT_POSE: Record<Beat["type"], PoseName> = {
  title: "stand", text: "present", icon: "present", cards: "present", chart: "pointR", counter: "shock", donut: "pointR",
  grid: "pointR", timeline: "pointR", tags: "present", list: "pointR", steps: "pointUpR", stamp: "shock", bars: "pointR",
  jars: "hold", compare: "present", flow: "pointR", prop: "present", props: "present", cross: "hips", quote: "present",
  cast: "pointR", clear: "stand",
};
const BEAT_SFX: Record<Beat["type"], Cue[1]> = {
  title: "whoosh", text: "pop", icon: "pop", cards: "pop", chart: "whoosh", counter: "tick", donut: "pop", grid: "pop",
  timeline: "pop", tags: "pop", list: "pop", steps: "pop", stamp: "thud", bars: "whoosh", jars: "pop", compare: "pop",
  flow: "pop", prop: "pop", props: "pop", cross: "thud", quote: "pop", cast: "pop", clear: "whoosh",
};
/** Default framing per beat: big content gets the wide shot, single statements a push-in. */
const BEAT_CAMERA: Record<Beat["type"], CameraMode> = {
  title: "wide", text: "content", icon: "content", cards: "wide", chart: "wide", counter: "content", donut: "wide",
  grid: "wide", timeline: "wide", tags: "wide", list: "wide", steps: "wide", stamp: "content", bars: "wide", jars: "wide",
  compare: "wide", flow: "wide", prop: "content", props: "wide", cross: "wide", quote: "content", cast: "wide", clear: "stick",
};
const itemCount = (b: Beat) =>
  "items" in b ? b.items.length : "bars" in b ? b.bars.length : "jars" in b ? b.jars.length : "segments" in b ? b.segments.length : "points" in b ? b.points.length : "icons" in b && b.icons ? b.icons.length : 1;

const DEFAULT_SETS: SetName[] = ["room", "office", "street", "board", "park", "kitchen", "bank"];

/** A scene built entirely from script.json. */
export const AutoScene: React.FC<{ scene: ScriptScene; index?: number; timing: SceneTiming; voice: string; duration: number; endCard?: number }> = ({
  scene,
  index = 0,
  timing,
  voice,
  duration,
  endCard = 0,
}) => {
  const f = useCurrentFrame();
  const L: Record<string, Line> = Object.fromEntries(timing.lines.map((l) => [l.key, l]));
  const steps = scene.lines.map((sl) => ({ sl, line: L[sl.key] })).filter((s) => s.line);
  const beats = steps.filter((s) => s.sl.beat);
  const set = scene.set ?? DEFAULT_SETS[index % DEFAULT_SETS.length];
  const dark = DARK_SETS.includes(set);
  const stickX = scene.stickX ?? 330;
  const ink = dark ? C.white : C.ink;

  // Stick's poses
  const keys: PoseKey[] = [[0, "stand"]];
  for (const { sl, line } of steps) {
    const p = sl.pose ?? (sl.beat ? BEAT_POSE[sl.beat.type] : undefined);
    if (p === "wave") keys.push([line.start, "stand"]);
    else if (p) {
      if (!(p in POSES)) throw new Error(`line "${sl.key}": unknown pose "${p}" - one of: wave, ${Object.keys(POSES).join(", ")}`);
      keys.push([line.start, p]);
    }
  }
  let pose = poseAt(f, keys);
  const current = steps.filter((s) => f >= s.line.start).pop();
  if (current?.sl.pose === "wave") pose = waving(pose, f);
  const expr = current?.sl.expr ?? "smile";
  const emoteLine = steps.filter((s) => s.sl.emote && f >= s.line.start && f < s.line.end + 20).pop();
  const holding = steps.filter((s) => f >= s.line.start && s.sl.holding !== undefined).pop()?.sl.holding;

  // camera: frame each line, returning to wide for the end card
  const FRAMES: Record<CameraMode, { zoom: number; x: number; y: number }> = {
    wide: { zoom: 1, x: W / 2, y: H / 2 },
    stick: { zoom: 1.3, x: stickX + 300, y: GROUND - 300 },
    content: { zoom: 1.1, x: 1075, y: 500 },
    close: { zoom: 1.55, x: stickX + 160, y: GROUND - 330 },
  };
  const camera: CamKey[] = [[0, FRAMES.wide]];
  let active: Beat | undefined;
  for (const { sl, line } of steps) {
    if (sl.beat && sl.beat.type !== "cast") active = sl.beat.type === "clear" ? undefined : sl.beat;
    let mode = sl.camera ?? (sl.beat ? BEAT_CAMERA[sl.beat.type] : active ? BEAT_CAMERA[active.type] : "stick");
    // never crop a beat that is on screen: tight Stick shots only when the stage is empty
    if (active && (mode === "stick" || mode === "close")) mode = "content";
    camera.push([Math.max(0, line.start - 8), FRAMES[mode], 28]);
  }
  if (endCard > 0) camera.push([duration - endCard, FRAMES.wide, 20]);

  const shake = beats.filter((b) => b.sl.beat!.type === "stamp").map((b) => b.line.start + 4);

  const sfx: Cue[] = beats.flatMap(({ sl, line }) => {
    const b = sl.beat!;
    if (b.type === "clear") return [];
    const len = line.end - line.start;
    const n = itemCount(b);
    const base: Cue[] = [[line.start + 2, BEAT_SFX[b.type], 0.4]];
    if (n > 1 && b.type !== "chart") for (let i = 1; i < n; i++) base.push([line.start + spread(i, n, len), b.type === "cross" ? "pop" : BEAT_SFX[b.type] === "whoosh" ? "pop" : BEAT_SFX[b.type], 0.3]);
    if (b.type === "cross") for (let i = 0; i < n; i++) base.push([line.start + spread(i, n, len) + 18, "thud", 0.35]);
    if (b.type === "bars" || b.type === "counter" || b.type === "chart") base.push([line.start + Math.round(len * 0.75), "ding", 0.35]);
    return base;
  });
  for (const { sl, line } of steps) if (sl.burst) sfx.push([line.start + 2, sl.burst === "coins" ? "ding" : "pop", 0.35]);

  const castBeat = beats.filter((b) => b.sl.beat!.type === "cast" && f >= b.line.start).pop();
  const castDef = castBeat ? (castBeat.sl.beat as Extract<Beat, { type: "cast" }>) : null;
  const castCleared = castBeat && beats.some((b) => b.sl.beat!.type === "clear" && b.line.start > castBeat.line.start && f >= b.line.start);
  const titleBeat = beats.find((b) => b.sl.beat!.type === "title");
  const onEndCard = endCard > 0 && f >= duration - endCard;

  return (
    <Scene
      lines={L}
      voice={voice}
      duration={duration}
      sfx={sfx}
      set={set}
      camera={camera}
      shake={shake}
      overlay={titleBeat ? <TitleStage beat={titleBeat.sl.beat as Extract<Beat, { type: "title" }>} f={f} end={titleBeat.line.end + 14} /> : undefined}
    >
      {beats.map(({ sl, line }, i) => {
        const b = sl.beat!;
        if (b.type === "title" || b.type === "cast" || b.type === "clear") return null;
        const next = beats.slice(i + 1).find((x) => x.sl.beat!.type !== "cast");
        const end = next ? next.line.start : duration - endCard;
        // hand over between beats in a few frames, so the stage never sits empty
        if (f < line.start - 4 || f > end + 4) return null;
        const o = Math.min(ease(f, line.start - 4, 6), 1 - ease(f, end - 4, 7));
        return (
          <g key={sl.key} opacity={o}>
            {/* a Sequence so pieces that read the frame themselves (Stamp, Arrow, CrossOut) count from the beat */}
            <Sequence from={line.start} layout="none">
              <BeatView beat={b} f={f - line.start} len={line.end - line.start} dark={dark} />
            </Sequence>
          </g>
        );
      })}

      {steps.map(({ sl, line }) => (sl.burst ? <Burst key={sl.key} at={line.start + 4} x={CX} y={420} kind={sl.burst} /> : null))}

      {castDef && castBeat && !castCleared && !onEndCard && (
        <g opacity={ease(f, castBeat.line.start, 10)}>
          <Stick
            x={1660}
            y={GROUND}
            scale={1.55}
            color={CAST[castDef.who].color}
            accessory={CAST[castDef.who].accessory}
            seed={CAST[castDef.who].seed}
            pose={poseAt(f, [[0, castDef.pose ?? "stand"]])}
            expr={castDef.expr ?? "smug"}
            emote={castDef.emote}
          />
          {castDef.label && (
            <g transform={`translate(1660 ${GROUND - 520})`}>
              <Chip text={castDef.label} font="display" size={40} fill={light(CAST[castDef.who].tag, C.white)} />
            </g>
          )}
        </g>
      )}

      {onEndCard && <EndCard f={f - (duration - endCard)} dark={dark} />}
      <Stick
        x={endCard > 0 ? lerp(stickX, 300, ease(f, duration - endCard, 25)) : stickX}
        y={GROUND}
        scale={1.6}
        color={ink}
        pose={onEndCard ? waving(pose, f) : pose}
        expr={onEndCard ? "grin" : expr}
        emote={onEndCard ? undefined : emoteLine?.sl.emote}
        holding={onEndCard ? undefined : holding || undefined}
        talking={speaking(f, L)}
      />
    </Scene>
  );
};

// ---- small geometry helpers --------------------------------------------------------------------

const wrap = (text: string, max: number) => {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
};

const niceMax = (v: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(v || 1)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
};

/** A smooth path through points (Catmull-Rom as cubic Béziers). */
const smooth = (pts: [number, number][]) => {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  return d;
};

const interpY = (pts: [number, number][], x: number) => {
  for (let i = 0; i < pts.length - 1; i++) {
    if (x >= pts[i][0] && x <= pts[i + 1][0]) return lerp(pts[i][1], pts[i + 1][1], (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0] || 1));
  }
  return pts[pts.length - 1][1];
};

const interpV = (values: (number | null)[], px: (i: number) => number, x: number) => {
  for (let i = 0; i < values.length - 1; i++) {
    const a = values[i];
    const b = values[i + 1];
    if (a === null || b === null) continue;
    if (x >= px(i) && x <= px(i + 1)) return lerp(a, b, (x - px(i)) / (px(i + 1) - px(i) || 1));
  }
  const last = [...values].reverse().find((v) => v !== null);
  return last ?? 0;
};

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const rad = (a: number) => ((a - 90) * Math.PI) / 180;
  const large = a1 - a0 > 180 ? 1 : 0;
  const end = Math.min(a1, a0 + 359.9);
  return `M ${cx + r * Math.cos(rad(a0))} ${cy + r * Math.sin(rad(a0))} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(rad(end))} ${cy + r * Math.sin(rad(end))}`;
};

