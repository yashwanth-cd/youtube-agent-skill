import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Arrow,
  C,
  CoinStream,
  Cue,
  ease,
  Envelope,
  GROUND,
  hands,
  Jar,
  lerp,
  mix,
  Phone,
  Pop,
  poseAt,
  Safe,
  Scene,
  Slide,
  speaking,
  Stick,
  streamCues,
  Tag,
  Tea,
  Thought,
  TitleCard,
  Tumbleweed,
  Txt,
} from "#engine";
import { T, sceneProps } from "../timing";

const L = T.lines("way1");
const SLOT = [760, 1010, 1260, 1510];
const JARS = [
  { label: "RENT", color: C.redLight },
  { label: "FOOD", color: C.goldLight },
  { label: "FUN", color: C.blueLight },
  { label: "SAVINGS", color: C.green },
];

export const Way1: React.FC = () => {
  const f = useCurrentFrame();
  const m = L.most.start;
  const fl = L.flip.start;
  const swap = ease(f, fl + 25, 40);
  const jarsOut = L.brain.start;

  // where each jar sits: savings moves from last to first during the flip
  const slotOf = (i: number) => (i === 3 ? lerp(SLOT[3], SLOT[0], swap) : lerp(SLOT[i], SLOT[i + 1], swap));
  const hop = (i: number) => (i === 3 ? -Math.sin(Math.PI * swap) * 220 : 0);

  // old order: rent, food, fun get paid; savings gets nothing
  const firstFill = [0.8, 0.65, 0.75, 0];
  const payAt = [m + 50, m + 95, m + 140, m + 200];
  // new order: savings first, then the rest
  const savingsAt = fl + 85;
  const restAt = [L.rest.start + 2, L.rest.start + 12, L.rest.start + 22];
  const drain = 1 - ease(f, fl, 15);
  const fillOf = (i: number) => {
    if (f < fl) return firstFill[i] * ease(f, payAt[i] + 14, 14);
    if (i === 3) return 0.55 * ease(f, savingsAt + 14, 16);
    return firstFill[i] * drain + 0.5 * ease(f, restAt[i] + 14, 12);
  };

  const sx = 330;
  const pose = poseAt(f, [
    [0, "stand"],
    [m, "hold"],
    [L.nothing.start, "shrug"],
    [fl, "pointR"],
    [L.rest.start, "hold"],
    [L.brain.start, "think"],
    [L.small.start, "present"],
    [L.auto.start, "pointR"],
    [L.boring.start, "relaxed"],
  ]);
  const h = hands(pose);
  const from: [number, number] = [sx + h.r[0] * 1.35, GROUND + h.r[1] * 1.35 - 30];
  const jarTop = (i: number): [number, number] => [slotOf(i), GROUND - 250];

  // slice slider steps up every "raise"
  const steps = [L.small.start + 70, L.small.start + 105, L.small.start + 140];
  const knobX = lerp(720, 1500, 0.1 + 0.25 * steps.reduce((a, s) => a + ease(f, s, 10), 0));

  const autoOn = ease(f, L.auto.start + 45, 10);

  const sfx: Cue[] = [
    [18, "whoosh", 0.4],
    [20, "pop", 0.4],
    ...JARS.map((_, i) => [m + 10 + i * 8, "pop", 0.3] as Cue),
    ...payAt.slice(0, 3).flatMap((a) => streamCues(a, 3)),
    [L.nothing.start + 10, "whoosh", 0.25],
    [fl + 25, "whoosh", 0.4],
    ...streamCues(savingsAt, 4),
    [savingsAt + 40, "ding", 0.35],
    ...restAt.flatMap((a) => streamCues(a, 2)),
    [L.brain.start + 30, "thud", 0.4],
    [L.brain.start + 90, "pop", 0.35],
    ...steps.map((s) => [s, "pop", 0.4] as Cue),
    [L.auto.start + 45, "tick", 0.6],
    ...streamCues(L.auto.start + 60, 6, 12, 24, "pop", 0.2),
    [L.boring.start, "pop", 0.3],
  ];

  return (
    <Scene {...sceneProps("way1")} sfx={sfx}>
      {/* the four jars */}
      {f >= m && f < jarsOut + 20 && (
        <g opacity={1 - ease(f, jarsOut, 15)}>
          {JARS.map((j, i) => (
            <Pop key={j.label} at={m + 10 + i * 8} x={slotOf(i)} y={GROUND + hop(i)}>
              <Jar label={j.label} color={j.color} fill={fillOf(i)} scale={1.25} />
            </Pop>
          ))}
          {f < fl &&
            [0, 1, 2, 3].map((i) => (
              <Pop key={i} at={payAt[i] - 4} x={SLOT[i]} y={GROUND - 300} out={fl}>
                <Txt x={0} y={0} size={44} font="display" color={C.inkSoft}>
                  {i + 1}
                </Txt>
              </Pop>
            ))}
          {f >= fl + 60 &&
            [0, 1, 2, 3].map((i) => (
              <Pop key={i} at={i === 0 ? fl + 70 : restAt[i - 1] - 4} x={SLOT[i]} y={GROUND - 300}>
                <Txt x={0} y={0} size={44} font="display" color={i === 0 ? C.green : C.inkSoft}>
                  {i + 1}
                </Txt>
              </Pop>
            ))}
        </g>
      )}
      {payAt.slice(0, 3).map((a, i) => (
        <CoinStream key={i} at={a} from={from} to={jarTop(i)} />
      ))}
      <CoinStream at={savingsAt} from={from} to={jarTop(3)} n={4} />
      {restAt.map((a, i) => (
        <CoinStream key={i} at={a} from={from} to={jarTop(i)} n={2} />
      ))}

      {/* nothing left: tumbleweed */}
      {f > L.nothing.start && f < fl + 10 && (
        <>
          <Tumbleweed x={mix(f, [L.nothing.start, L.nothing.start + 80], [1900, 1100])} y={GROUND - 40} spin={-f * 9} />
          <Pop at={L.nothing.start + 20} x={SLOT[3]} y={GROUND - 370}>
            <Tag x={0} y={0} text="$0 LEFT" fill={C.redLight} font="display" size={40} />
          </Pop>
        </>
      )}

      {/* out of sight, out of mind */}
      {f >= L.brain.start && f < L.small.start + 5 && (
        <g opacity={1 - ease(f, L.small.start - 10, 12)}>
          <Pop at={L.brain.start + 10} x={1350} y={GROUND}>
            <Safe scale={1.3} />
          </Pop>
          <g transform={`translate(${mix(f, [L.brain.start + 10, L.brain.start + 30], [SLOT[0], 1350])} ${GROUND - mix(f, [L.brain.start + 10, L.brain.start + 30], [0, 120])}) scale(${1 - ease(f, L.brain.start + 18, 12)})`}>
            <Jar label="SAVINGS" color={C.green} fill={0.55} />
          </g>
          <Pop at={L.brain.start + 90} x={760} y={300}>
            <Thought x={0} y={0} w={620} h={230} from={[-220, 260]}>
              <Txt x={0} y={-30} size={52} font="display">
                OUT OF SIGHT,
              </Txt>
              <Txt x={0} y={36} size={52} font="display" color={C.green}>
                OUT OF MIND
              </Txt>
            </Thought>
          </Pop>
          <Slide at={L.brain.start + 190} from={[0, 40]} x={1350} y={GROUND - 380}>
            <Tag x={0} y={0} text="separate account" size={42} fill={C.greenLight} />
          </Slide>
        </g>
      )}

      {/* the slice slider */}
      {f >= L.small.start && f < L.auto.start + 5 && (
        <g opacity={ease(f, L.small.start, 12) * (1 - ease(f, L.auto.start - 8, 10))}>
          <Txt x={1110} y={330} size={60} font="display">
            YOUR SLICE
          </Txt>
          <rect x={720} y={440} width={780} height={26} rx={13} fill={C.paperDark} stroke={C.ink} strokeWidth={5} />
          <rect x={720} y={440} width={knobX - 720} height={26} rx={13} fill={C.green} stroke={C.ink} strokeWidth={5} />
          <circle cx={knobX} cy={453} r={30} fill={C.white} stroke={C.ink} strokeWidth={6} />
          <Txt x={760} y={530} size={38} color={C.inkSoft}>
            start small
          </Txt>
          {steps.map((s, i) => (
            <Pop key={i} at={s} x={lerp(720, 1500, 0.35 + 0.25 * i)} y={370}>
              <Tag x={0} y={0} text="+ raise" size={32} fill={C.goldLight} />
            </Pop>
          ))}
        </g>
      )}

      {/* automate it */}
      {f >= L.auto.start && (
        <g opacity={ease(f, L.auto.start, 12) * (1 - ease(f, L.boring.start - 6, 10))}>
          <Pop at={L.auto.start} x={1180} y={470}>
            <Phone on={autoOn} />
          </Pop>
          <Pop at={L.auto.start + 10} x={800} y={420}>
            <Envelope scale={0.7} />
          </Pop>
          <Pop at={L.auto.start + 15} x={1600} y={GROUND}>
            <Jar label="SAVINGS" color={C.green} fill={0.2 + 0.5 * ease(f, L.auto.start + 70, 80)} />
          </Pop>
          {autoOn > 0.5 && <CoinStream at={L.auto.start + 60} from={[800, 420]} to={[1600, GROUND - 210]} n={6} every={12} dur={24} arc={280} />}
          <Arrow at={L.auto.start + 50} x1={1300} y1={330} x2={1560} y2={520} color={C.green} />
        </g>
      )}

      {/* boring */}
      {f >= L.boring.start && (
        <Slide at={L.boring.start} from={[0, 40]} x={960} y={330}>
          <Tag x={0} y={0} text="BORING = GOOD" font="display" size={72} fill={C.greenLight} />
        </Slide>
      )}

      <Stick x={sx} y={GROUND} scale={1.35} pose={pose} talking={speaking(f, L)} expr={f > L.nothing.start && f < fl ? "worried" : "smile"} />
      {f >= L.boring.start && <Tea x={sx + h.r[0] * 1.35} y={GROUND + h.r[1] * 1.35} scale={1.3} />}

      <TitleCard n={1} title="PAY YOURSELF FIRST" sub="before anything else gets paid" start={0} end={L.most.start - 15} color={C.green} />
    </Scene>
  );
};
