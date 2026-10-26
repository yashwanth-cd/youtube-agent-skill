import React from "react";
import { Sequence, useCurrentFrame } from "remotion";
import { Line, SceneTiming, ease, lerp, pop, speaking } from "./anim";
import { Cue, Scene } from "./common";
import * as P from "./props";
import { Expr, POSES, PoseKey, PoseName, Stick, poseAt, waving } from "./Stick";
import { C, GROUND } from "./theme";
import { Arrow, CrossOut, Stamp, Tag, TitleCard, Txt } from "./ui";

/**
 * Scenes declared in script.json instead of code. Each line can carry:
 *   "pose": a Stick pose name, "expr": a face, and "beat": what appears on screen.
 * A beat stays up until the next line with a beat. The beat catalogue is in
 * .claude/skills/stickman-video/beats.md - keep the two in sync.
 */

export type Beat =
  | { type: "title"; n?: number; title: string; sub?: string; color?: string }
  | { type: "text"; text: string; sub?: string; color?: string }
  | { type: "tags"; items: string[]; colors?: string[] }
  | { type: "list"; title?: string; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "stamp"; text: string; color?: string }
  | { type: "bars"; title?: string; bars: { label: string; value: number; top?: string; under?: string; color?: string }[] }
  | { type: "jars"; jars: { label: string; fill: number; color?: string }[]; coins?: boolean }
  | { type: "compare"; left: Side; right: Side }
  | { type: "flow"; items: string[] }
  | { type: "prop"; name: PropName; label?: string; args?: Record<string, unknown> }
  | { type: "props"; items: { name: PropName; label?: string }[] }
  | { type: "cross"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "cast"; who: CastName; label?: string; expr?: Expr; pose?: PoseName }
  | { type: "clear" };

type Side = { title: string; items?: string[]; color?: string; prop?: PropName };

export type ScriptLine = { key: string; text: string; screen?: string; pose?: PoseName | "wave"; expr?: Expr; beat?: Beat };
export type ScriptScene = { id: string; chapter: string; stickX?: number; lines: ScriptLine[] };
export type Script = { scenes: ScriptScene[] };

/** Named colours a script can use instead of hex. */
const COLOR: Record<string, string> = { green: C.green, red: C.red, blue: C.blue, gold: C.gold, ink: C.ink };
const LIGHT: Record<string, string> = { green: C.greenLight, red: C.redLight, blue: C.blueLight, gold: C.goldLight, ink: C.white };
const col = (c: string | undefined, fallback: string) => (c ? (COLOR[c] ?? c) : fallback);
const light = (c: string | undefined, fallback: string) => (c ? (LIGHT[c] ?? c) : fallback);
const CYCLE = ["green", "blue", "gold", "red"];

// ---- props a script can name -------------------------------------------------------------------

// props have different prop types; the registry only needs to place them by x/y/scale
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PropDef = { C: React.FC<any>; ground: boolean; scale: number };
const PROPS = {
  jar: { C: P.Jar, ground: true, scale: 1.4 },
  bucket: { C: P.Bucket, ground: true, scale: 1.3 },
  car: { C: P.Car, ground: true, scale: 1.4 },
  fancyCar: { C: (p: object) => <P.Car fancy color={C.gold} {...p} />, ground: true, scale: 1.3 },
  moneyTree: { C: P.MoneyTree, ground: true, scale: 0.95 },
  safe: { C: P.Safe, ground: true, scale: 1.4 },
  tv: { C: (p: object) => <P.TV w={320} {...p} />, ground: true, scale: 1.2 },
  shop: { C: P.Shop, ground: true, scale: 1.4 },
  lemonade: { C: P.Lemonade, ground: true, scale: 1.2 },
  couch: { C: P.Couch, ground: true, scale: 1 },
  bathtub: { C: P.Bathtub, ground: true, scale: 1.3 },
  basket: { C: P.Basket, ground: true, scale: 1.3 },
  hammock: { C: P.Hammock, ground: true, scale: 1 },
  sign: { C: (p: object) => <P.Sign text="" {...p} />, ground: true, scale: 1.2 },
  cash: { C: P.CashStack, ground: false, scale: 1.4 },
  coin: { C: P.Coin, ground: false, scale: 2.4 },
  bill: { C: P.Bill, ground: false, scale: 1.8 },
  envelope: { C: P.Envelope, ground: false, scale: 1.2 },
  calendar: { C: (p: object) => <P.Calendar label="1" {...p} />, ground: false, scale: 1.4 },
  phone: { C: P.Phone, ground: false, scale: 1 },
  card: { C: P.CreditCard, ground: false, scale: 1.4 },
  clock: { C: P.Clock, ground: false, scale: 1.2 },
  gear: { C: P.Gear, ground: false, scale: 1.3 },
  book: { C: P.Book, ground: false, scale: 1.6 },
  certificate: { C: P.Certificate, ground: false, scale: 1.4 },
  ticket: { C: P.Ticket, ground: false, scale: 1.4 },
  rocket: { C: P.Rocket, ground: false, scale: 1.3 },
  snowball: { C: P.Snowball, ground: false, scale: 2.2 },
  monster: { C: P.Monster, ground: false, scale: 1.2 },
  hammer: { C: P.Hammer, ground: false, scale: 1.2 },
  pizza: { C: P.Pizza, ground: false, scale: 1.4 },
  tea: { C: P.Tea, ground: false, scale: 2.5 },
  tumbleweed: { C: P.Tumbleweed, ground: false, scale: 2 },
} satisfies Record<string, PropDef>;
export type PropName = keyof typeof PROPS;
export const PROP_NAMES = Object.keys(PROPS) as PropName[];

const PropAt: React.FC<{ name: PropName; x: number; y?: number; scale?: number; args?: Record<string, unknown> }> = ({ name, x, y, scale = 1, args }) => {
  const def: PropDef = PROPS[name];
  if (!def) throw new Error(`unknown prop "${name}" - one of: ${PROP_NAMES.join(", ")}`);
  const Comp = def.C;
  const s = def.scale * scale;
  return <Comp x={x} y={y ?? (def.ground ? GROUND : 470)} scale={s} {...args} />;
};

// ---- the second character ----------------------------------------------------------------------

export type CastName = "larry" | "boss" | "shady" | "friend";
const CAST: Record<CastName, { color: string; accessory: "glasses" | "tie" | "shades" | "cap"; seed: number }> = {
  larry: { color: C.blue, accessory: "glasses", seed: 5 },
  boss: { color: C.ink, accessory: "tie", seed: 9 },
  shady: { color: C.inkSoft, accessory: "shades", seed: 11 },
  friend: { color: C.green, accessory: "cap", seed: 7 },
};

// ---- beats -------------------------------------------------------------------------------------

const CX = 1200;

/** Frame within [0, len) at which item i of n appears, spread across the spoken line. */
const spread = (i: number, n: number, len: number) => Math.round(8 + (i * Math.max(0, len - 30)) / Math.max(1, n));

const Popper: React.FC<{ f: number; at: number; x: number; y: number; children: React.ReactNode; rotate?: number }> = ({ f, at, x, y, children, rotate = 0 }) => {
  if (f < at) return null;
  const s = pop(f, at);
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.max(0, s)}) rotate(${rotate})`} opacity={Math.min(1, s * 2)}>
      {children}
    </g>
  );
};

/** Draws one beat. `f` is frames since the beat started, `len` the spoken length of its line. */
const BeatView: React.FC<{ beat: Beat; f: number; len: number }> = ({ beat, f, len }) => {
  switch (beat.type) {
    case "title":
      return null; // drawn full-screen by AutoScene
    case "text":
      return (
        <Popper f={f} at={4} x={CX} y={420}>
          <Txt x={0} y={0} size={beat.text.length > 18 ? 84 : 110} font="display" color={col(beat.color, C.ink)}>
            {beat.text}
          </Txt>
          {beat.sub && (
            <Txt x={0} y={100} size={50} color={C.inkSoft}>
              {beat.sub}
            </Txt>
          )}
        </Popper>
      );
    case "tags":
      return (
        <>
          {beat.items.map((t, i) => (
            <Popper key={i} f={f} at={spread(i, beat.items.length, len)} x={CX + (i % 2 ? 170 : -170) * (beat.items.length > 2 ? 1 : 0)} y={260 + i * (beat.items.length > 4 ? 100 : 130)} rotate={i % 2 ? 3 : -3}>
              <Tag x={0} y={0} text={t} size={46} fill={light(beat.colors?.[i] ?? CYCLE[i % 4], C.white)} />
            </Popper>
          ))}
        </>
      );
    case "list":
      return (
        <>
          {beat.title && (
            <Popper f={f} at={2} x={CX} y={230}>
              <Txt x={0} y={0} size={64} font="display">
                {beat.title}
              </Txt>
            </Popper>
          )}
          {beat.items.map((t, i) => (
            <Popper key={i} f={f} at={spread(i, beat.items.length, len)} x={CX - 360} y={(beat.title ? 340 : 270) + i * 95}>
              <path d="M -12 0 L 4 16 L 34 -18" stroke={C.green} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <Txt x={60} y={0} size={56} anchor="start">
                {t}
              </Txt>
            </Popper>
          ))}
        </>
      );
    case "steps":
      return (
        <>
          {beat.items.map((t, i) => {
            const n = beat.items.length;
            const x = CX + (i - (n - 1) / 2) * Math.min(260, 1000 / n);
            return (
              <Popper key={i} f={f} at={spread(i, n, len)} x={x} y={360}>
                <circle r={62} fill={col(CYCLE[i % 4], C.green)} stroke={C.ink} strokeWidth={7} />
                <Txt x={0} y={6} size={70} color={C.white} font="display">
                  {i + 1}
                </Txt>
                <Txt x={0} y={120} size={38} font="display">
                  {t}
                </Txt>
              </Popper>
            );
          })}
        </>
      );
    case "stamp":
      return <Stamp at={2} x={CX} y={300} text={beat.text} color={col(beat.color, C.red)} size={beat.text.length > 16 ? 60 : 76} />;
    case "bars": {
      const max = Math.max(...beat.bars.map((b) => b.value));
      const n = beat.bars.length;
      const gap = Math.min(300, 1000 / n);
      return (
        <>
          {beat.title && (
            <Txt x={CX} y={150} size={56} font="display" opacity={ease(f, 2, 10)}>
              {beat.title}
            </Txt>
          )}
          <path d={`M ${CX - (gap * n) / 2} ${GROUND} L ${CX + (gap * n) / 2} ${GROUND}`} stroke={C.ink} strokeWidth={6} />
          {beat.bars.map((b, i) => {
            const at = spread(i, n, len);
            const g = ease(f, at, 30);
            const h = (b.value / max) * 480 * g;
            const x = CX + (i - (n - 1) / 2) * gap;
            return (
              <g key={i}>
                <rect x={x - 65} y={GROUND - h} width={130} height={h} rx={8} fill={col(b.color ?? CYCLE[i % 4], C.green)} stroke={C.ink} strokeWidth={6} />
                {b.top && g > 0.95 && (
                  <Txt x={x} y={GROUND - h - 40} size={50} font="display">
                    {b.top}
                  </Txt>
                )}
                <Txt x={x} y={GROUND + 44} size={38} font="display" opacity={ease(f, at, 8)}>
                  {b.label}
                </Txt>
                {b.under && (
                  <Txt x={x} y={GROUND + 90} size={32} color={C.inkSoft} opacity={ease(f, at + 20, 8)}>
                    {b.under}
                  </Txt>
                )}
              </g>
            );
          })}
        </>
      );
    }
    case "jars": {
      const n = beat.jars.length;
      const gap = Math.min(260, 1050 / n);
      return (
        <>
          {beat.jars.map((j, i) => {
            const at = spread(i, n, len);
            const x = CX + (i - (n - 1) / 2) * gap;
            return (
              <g key={i}>
                <Popper f={f} at={at} x={x} y={GROUND}>
                  <P.Jar label={j.label} fill={j.fill * ease(f, at + 12, 25)} color={col(j.color ?? CYCLE[i % 4], C.gold)} scale={1.25} />
                </Popper>
                {beat.coins &&
                  [0, 1, 2].map((k) => {
                    const t = ease(f, at + k * 5, 18, (x) => x);
                    if (t <= 0 || t >= 1) return null;
                    return <P.Coin key={k} x={lerp(560, x, t)} y={lerp(560, GROUND - 250, t) - Math.sin(Math.PI * t) * 160} scale={1.2} rotate={t * 540} />;
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
            const x = CX + (i ? 280 : -280);
            const at = i ? Math.round(len * 0.45) : 4;
            return (
              <g key={i}>
                <Popper f={f} at={at} x={x} y={190}>
                  <Tag x={0} y={0} text={s.title} font="display" size={50} fill={light(s.color ?? (i ? "green" : "red"), C.white)} />
                </Popper>
                {s.prop && f >= at && <PropAt name={s.prop} x={x} scale={0.8} />}
                {(s.items ?? []).map((t, k) => (
                  <Popper key={k} f={f} at={at + 10 + k * 12} x={x} y={300 + k * 76}>
                    <Txt x={0} y={0} size={46}>
                      {t}
                    </Txt>
                  </Popper>
                ))}
              </g>
            );
          })}
          <path d={`M ${CX} 150 L ${CX} 700`} stroke={C.inkSoft} strokeWidth={5} opacity={ease(f, 4, 10) * 0.6} />
        </>
      );
    case "flow": {
      const n = beat.items.length;
      const gap = Math.min(380, 1100 / n);
      const xs = beat.items.map((_, i) => CX + (i - (n - 1) / 2) * gap);
      return (
        <>
          {beat.items.map((t, i) => (
            <Popper key={i} f={f} at={spread(i, n, len)} x={xs[i]} y={400}>
              <Tag x={0} y={0} text={t} size={42} fill={light(CYCLE[i % 4], C.white)} />
            </Popper>
          ))}
          {xs.slice(1).map((x, i) => (
            <Arrow key={i} at={spread(i + 1, n, len) - 6} x1={xs[i] + 40} y1={470} x2={x - 40} y2={470} bend={-40} />
          ))}
        </>
      );
    }
    case "prop":
      return (
        <Popper f={f} at={4} x={0} y={0}>
          <PropAt name={beat.name} x={CX} args={beat.args} />
          {beat.label && <Tag x={CX} y={170} text={beat.label} font="display" size={52} fill={C.goldLight} />}
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
                <PropAt name={it.name} x={x} scale={n > 2 ? 0.75 : 0.9} />
                {it.label && <Tag x={x} y={250} text={it.label} size={40} />}
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
            const isProp = (PROP_NAMES as string[]).includes(t);
            return (
              <g key={i}>
                <Popper f={f} at={at} x={0} y={0}>
                  {isProp ? (
                    <PropAt name={t as PropName} x={x} y={430} scale={0.7} />
                  ) : (
                    <Tag x={x} y={430} text={t} size={44} />
                  )}
                </Popper>
                <CrossOut at={at + 18} x={x} y={430} size={90} />
              </g>
            );
          })}
        </>
      );
    }
    case "quote":
      return (
        <Popper f={f} at={4} x={CX - 100} y={300}>
          <ellipse rx={420} ry={150} fill={C.white} stroke={C.ink} strokeWidth={6} />
          <path d="M -300 90 L -420 200 L -230 120" fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <Txt x={0} y={0} size={beat.text.length > 24 ? 46 : 60} font="display">
            {beat.text}
          </Txt>
        </Popper>
      );
    case "cast":
      return null; // drawn by AutoScene so the figure can stay across beats
    case "clear":
      return null;
  }
};

const BEAT_POSE: Record<Beat["type"], PoseName> = {
  title: "stand",
  text: "present",
  tags: "present",
  list: "pointR",
  steps: "pointUpR",
  stamp: "shock",
  bars: "pointR",
  jars: "hold",
  compare: "present",
  flow: "pointR",
  prop: "present",
  props: "present",
  cross: "hips",
  quote: "present",
  cast: "pointR",
  clear: "stand",
};

const BEAT_SFX: Record<Beat["type"], Cue[1]> = {
  title: "whoosh",
  text: "pop",
  tags: "pop",
  list: "pop",
  steps: "pop",
  stamp: "thud",
  bars: "whoosh",
  jars: "pop",
  compare: "pop",
  flow: "pop",
  prop: "pop",
  props: "pop",
  cross: "thud",
  quote: "pop",
  cast: "pop",
  clear: "whoosh",
};

/** A scene built entirely from script.json. */
/** The channel's end card: room on the right for YouTube's end-screen elements. */
export const EndCard: React.FC<{ f: number }> = ({ f }) => (
  <g opacity={ease(f, 0, 15)}>
    <Txt x={1220} y={170} size={78} font="display">
      THANKS FOR WATCHING
    </Txt>
    {[0, 1].map((i) => (
      <g key={i}>
        <rect x={760 + i * 500} y={300} width={440} height={248} rx={18} fill={C.white} stroke={C.ink} strokeWidth={5} strokeDasharray="16 12" />
        <Txt x={980 + i * 500} y={424} size={40} color={C.inkSoft}>
          {i === 0 ? "watch next" : "best for you"}
        </Txt>
      </g>
    ))}
    <Popper f={f} at={15} x={1220} y={680}>
      <rect x={-200} y={-50} width={400} height={100} rx={20} fill={C.red} stroke={C.ink} strokeWidth={6} />
      <Txt x={0} y={4} size={52} font="display" color={C.white}>
        SUBSCRIBE
      </Txt>
    </Popper>
  </g>
);

export const AutoScene: React.FC<{ scene: ScriptScene; timing: SceneTiming; voice: string; duration: number; endCard?: number }> = ({
  scene,
  timing,
  voice,
  duration,
  endCard = 0,
}) => {
  const f = useCurrentFrame();
  const L: Record<string, Line> = Object.fromEntries(timing.lines.map((l) => [l.key, l]));
  const steps = scene.lines.map((sl) => ({ sl, line: L[sl.key] })).filter((s) => s.line);
  const beats = steps.filter((s) => s.sl.beat);

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

  const sfx: Cue[] = beats.flatMap(({ sl, line }) => {
    const b = sl.beat!;
    const len = line.end - line.start;
    const n = "items" in b ? b.items.length : "bars" in b ? b.bars.length : "jars" in b ? b.jars.length : 1;
    if (b.type === "clear") return [];
    const base: Cue[] = [[line.start + 2, BEAT_SFX[b.type], 0.4]];
    if (n > 1) for (let i = 1; i < n; i++) base.push([line.start + spread(i, n, len), b.type === "cross" ? "pop" : BEAT_SFX[b.type], 0.3]);
    if (b.type === "cross") for (let i = 0; i < n; i++) base.push([line.start + spread(i, n, len) + 18, "thud", 0.35]);
    if (b.type === "bars") base.push([line.start + spread(n - 1, n, len) + 30, "ding", 0.35]);
    return base;
  });

  // which cast member is on stage: the last "cast" beat until a scene ends
  const castBeat = beats.filter((b) => b.sl.beat!.type === "cast" && f >= b.line.start).pop();
  const castDef = castBeat ? (castBeat.sl.beat as Extract<Beat, { type: "cast" }>) : null;
  const stickX = scene.stickX ?? 380;
  const titleBeat = beats.find((b) => b.sl.beat!.type === "title");

  return (
    <Scene lines={L} voice={voice} duration={duration} sfx={sfx}>
      {beats.map(({ sl, line }, i) => {
        const b = sl.beat!;
        if (b.type === "title" || b.type === "cast" || b.type === "clear") return null;
        const next = beats.slice(i + 1).find((x) => x.sl.beat!.type !== "cast");
        const end = next ? next.line.start : duration - endCard;
        if (f < line.start - 2 || f > end + 2) return null;
        const o = Math.min(ease(f, line.start - 2, 8), 1 - ease(f, end - 10, 10));
        return (
          <g key={sl.key} opacity={o}>
            {/* a Sequence so the ui pieces that read the frame themselves (Stamp, Arrow, CrossOut) count from the beat */}
            <Sequence from={line.start} layout="none">
              <BeatView beat={b} f={f - line.start} len={line.end - line.start} />
            </Sequence>
          </g>
        );
      })}

      {castDef && castBeat && f < duration - endCard && !beats.some((b) => b.sl.beat!.type === "clear" && b.line.start > castBeat.line.start && f >= b.line.start) && (
        <g opacity={ease(f, castBeat.line.start, 10)}>
          <Stick x={1640} y={GROUND} scale={1.35} color={CAST[castDef.who].color} accessory={CAST[castDef.who].accessory} seed={CAST[castDef.who].seed} pose={poseAt(f, [[0, castDef.pose ?? "stand"]])} expr={castDef.expr ?? "smug"} />
          {castDef.label && <Tag x={1640} y={GROUND - 470} text={castDef.label} font="display" size={40} fill={light("blue", C.blueLight)} />}
        </g>
      )}

      {endCard > 0 && f >= duration - endCard && <EndCard f={f - (duration - endCard)} />}
      <Stick
        x={endCard > 0 ? lerp(stickX, 300, ease(f, duration - endCard, 25)) : stickX}
        y={GROUND}
        scale={1.35}
        pose={endCard > 0 && f >= duration - endCard ? waving(pose, f) : pose}
        expr={endCard > 0 && f >= duration - endCard ? "grin" : expr}
        talking={speaking(f, L)}
      />

      {titleBeat && (() => {
        const b = titleBeat.sl.beat as Extract<Beat, { type: "title" }>;
        return <TitleCard n={b.n ?? 0} title={b.title} sub={b.sub} start={0} end={titleBeat.line.end + 20} color={col(b.color, C.green)} />;
      })()}
    </Scene>
  );
};
