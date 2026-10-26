import React from "react";
import { useCurrentFrame } from "remotion";
import {
  C,
  CrossOut,
  Cue,
  ease,
  FlyCoin,
  Gear,
  GROUND,
  hands,
  mix,
  Phone,
  Pop,
  poseAt,
  Rocket,
  Scene,
  Sign,
  speaking,
  Stick,
  Tag,
  Tea,
  Ticket,
  Txt,
  walking,
} from "#engine";
import { T, sceneProps } from "../timing";

const L = T.lines("machine");
const within = (f: number, a: number, b: number) => f >= a && f < b;

export const GEARS = [
  { label: "SAVE", color: C.green },
  { label: "NO DEBT", color: C.red },
  { label: "INVEST", color: C.blue },
  { label: "EARN MORE", color: C.gold },
  { label: "OWN", color: C.green },
];

/** The five-gear machine. `lit[i]` is the frame gear i lights up (Infinity = never). */
export const MachineArt: React.FC<{ lit: number[]; f: number; x?: number; y?: number; scale?: number; coinsFrom?: number }> = ({ lit, f, x = 0, y = 0, scale = 1, coinsFrom }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={380} y={300} width={1240} height={420} rx={30} fill={C.white} stroke={C.ink} strokeWidth={8} />
    <rect x={1620} y={560} width={120} height={60} fill={C.paperDark} stroke={C.ink} strokeWidth={6} />
    {GEARS.map((g, i) => {
      const on = f >= lit[i];
      const spinT = on ? f - lit[i] : 0;
      return (
        <g key={g.label}>
          <Gear x={520 + i * 240} y={460} r={86} teeth={10} spin={(i % 2 ? -1 : 1) * spinT * 2.5 + (i % 2 ? 18 : 0)} color={on ? g.color : C.paperDark} />
          <Txt x={520 + i * 240} y={650} size={38} font="display" color={on ? C.ink : C.inkSoft} opacity={on ? 1 : 0.5}>
            {g.label}
          </Txt>
        </g>
      );
    })}
    {coinsFrom !== undefined &&
      Array.from({ length: 12 }, (_, i) => (
        <FlyCoin key={i} at={coinsFrom + i * 14} from={[1740, 590]} to={[1840, 800]} dur={18} arc={60} />
      ))}
  </g>
);

export const Machine: React.FC = () => {
  const f = useCurrentFrame();
  const lit = [L.g1.start, L.g2.start, L.g3.start, L.g4.start, L.g5.start];
  const runStart = L.run.start + 35;
  const runEnd = L.run.start + 100;
  const running = within(f, runStart, runEnd);
  const sx = f < L.missing.start ? 190 : f < runStart ? 720 : f < L.boring.start ? mix(f, [runStart, runEnd], [720, -250]) : mix(f, [L.boring.start, L.boring.start + 50], [-150, 190]);
  const walkingBack = within(f, L.boring.start, L.boring.start + 50);

  const base = poseAt(f, [
    [0, "stand"],
    [L.intro.start, "present"],
    [L.missing.start, "hips"],
    [L.run.start, "shock"],
    [L.boring.start + 50, "relaxed"],
  ]);
  const pose = running ? walking(base, f * 0.6, 1, true) : walkingBack ? walking(base, f * 0.32) : base;
  const h = hands(pose);
  const machineOn = f < L.missing.start + 10 || f >= L.boring.start;
  const items = [L.missing.start + 45, L.missing.start + 75, L.missing.start + 105];

  const sfx: Cue[] = [
    [L.intro.start + 2, "whoosh", 0.4],
    ...lit.map((l) => [l, "pop", 0.45] as Cue),
    [L.g5.start + 20, "ding", 0.4],
    ...items.map((a) => [a, "pop", 0.35] as Cue),
    ...items.map((a) => [a + 25, "thud", 0.45] as Cue),
    [L.run.start + 10, "pop", 0.4],
    [runStart, "whoosh", 0.45],
    [L.boring.start + 70, "pop", 0.35],
  ];

  return (
    <Scene {...sceneProps("machine")} sfx={sfx}>
      {machineOn && (
        <g opacity={f < L.missing.start + 10 ? ease(f, L.intro.start, 12) * (1 - ease(f, L.missing.start - 4, 12)) : ease(f, L.boring.start, 15)}>
          <MachineArt lit={f >= L.boring.start ? [0, 0, 0, 0, 0] : lit} f={f} y={40} coinsFrom={f >= L.boring.start ? L.boring.start : L.g5.start + 20} />
        </g>
      )}

      {within(f, L.missing.start, L.run.start + 10) && (
        <g opacity={1 - ease(f, L.run.start - 4, 12)}>
          <Pop at={items[0]} x={1080} y={420}>
            <Ticket scale={1.1} />
          </Pop>
          <Pop at={items[1]} x={1380} y={430}>
            <Phone label="HOT-TIP!!" on={0} scale={0.8} />
          </Pop>
          <Pop at={items[2]} x={1680} y={440}>
            <Rocket scale={1.1} />
            <Txt x={0} y={110} size={34} font="display">
              MOON COIN
            </Txt>
          </Pop>
          {items.map((a, i) => (
            <CrossOut key={i} at={a + 25} x={1080 + i * 300} y={430} size={95} />
          ))}
        </g>
      )}

      {within(f, L.run.start, L.boring.start) && (
        <g opacity={ease(f, L.run.start, 10) * (1 - ease(f, L.boring.start - 12, 10))}>
          <Pop at={L.run.start + 10} x={1260} y={GROUND}>
            <Sign text="FAST + GUARANTEED" color={C.goldLight} />
          </Pop>
          <Stick x={1560} y={GROUND} scale={1.35} pose={poseAt(f, [[0, "present"], [L.run.start + 40, "presentL"]])} accessory="shades" seed={11} expr="smug" color={C.inkSoft} />
          <Pop at={runStart} x={900} y={260}>
            <Txt x={0} y={0} size={90} font="display" color={C.red}>
              RUN.
            </Txt>
          </Pop>
        </g>
      )}

      {f >= L.boring.start + 70 && (
        <Pop at={L.boring.start + 70} x={1000} y={170}>
          <Tag x={0} y={0} text="BORING, FOR A LONG TIME" font="display" size={60} fill={C.greenLight} />
        </Pop>
      )}

      <Stick x={sx} y={GROUND} scale={1.35} pose={pose} talking={speaking(f, L)} expr={within(f, L.run.start, L.boring.start) ? "o" : "smile"} />
      {f >= L.boring.start + 50 && <Tea x={sx + h.r[0] * 1.35} y={GROUND + h.r[1] * 1.35} scale={1.3} />}
    </Scene>
  );
};
