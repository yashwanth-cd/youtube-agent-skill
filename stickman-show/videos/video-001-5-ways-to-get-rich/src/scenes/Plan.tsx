import React from "react";
import { useCurrentFrame } from "remotion";
import {
  C,
  Cue,
  ease,
  Gear,
  GROUND,
  mix,
  Pop,
  poseAt,
  Scene,
  Sign,
  speaking,
  Stick,
  Tag,
  walking,
} from "#engine";
import { T, sceneProps } from "../timing";

const L = T.lines("plan");
const SIGNS = [
  { x: 560, text: "1", color: C.greenLight },
  { x: 790, text: "2", color: C.redLight },
  { x: 1020, text: "3", color: C.blueLight },
  { x: 1250, text: "4", color: C.goldLight },
  { x: 1480, text: "5", color: C.greenLight },
];

export const Plan: React.FC = () => {
  const f = useCurrentFrame();
  const walkEnd = L.plan.start + 70;
  const x = mix(f, [0, walkEnd], [-120, 300]);
  const moving = f < walkEnd;
  const base = poseAt(f, [
    [0, "stand"],
    [walkEnd, "stand"],
    [L.machine.start, "pointR"],
    [L.disclaimer.start, "shrug"],
    [L.disclaimer.start + 100, "present"],
  ]);
  const pose = moving ? walking(base, f * 0.32) : base;
  const signAt = (i: number) => L.plan.start + 30 + i * 16;
  const sfx: Cue[] = [
    ...SIGNS.map((_, i) => [signAt(i), "pop", 0.35] as Cue),
    [L.machine.start, "whoosh", 0.35],
    [L.disclaimer.start + 10, "pop", 0.4],
  ];
  return (
    <Scene {...sceneProps("plan")} sfx={sfx}>
      {SIGNS.map((s, i) => (
        <Pop key={s.text} at={signAt(i)} x={s.x} y={GROUND}>
          <Sign text={s.text} color={s.color} w={90} />
        </Pop>
      ))}
      {/* ghost of the machine waiting at the end of the road */}
      <g opacity={0.45 * ease(f, L.machine.start, 20)}>
        <rect x={1610} y={GROUND - 300} width={260} height={300} rx={20} fill="none" stroke={C.ink} strokeWidth={6} strokeDasharray="18 14" />
        <Gear x={1690} y={GROUND - 210} r={46} teeth={8} spin={f * 2} />
        <Gear x={1790} y={GROUND - 150} r={38} teeth={7} spin={-f * 2.4} />
        <Gear x={1700} y={GROUND - 80} r={30} teeth={6} spin={f * 3} />
      </g>
      <Stick x={x} y={GROUND} scale={1.35} pose={pose} talking={speaking(f, L)} expr="smile" />
      <Pop at={L.disclaimer.start + 10} x={960} y={250} rotate={-2}>
        <Tag x={0} y={0} text="EDUCATION, NOT FINANCIAL ADVICE" fill={C.goldLight} font="display" size={50} />
      </Pop>
    </Scene>
  );
};
