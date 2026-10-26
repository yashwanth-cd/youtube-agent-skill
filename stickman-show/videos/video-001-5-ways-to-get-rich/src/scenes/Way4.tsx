import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Arrow,
  Book,
  C,
  Car,
  CoinStream,
  Cue,
  Door,
  Draw,
  ease,
  GROUND,
  hands,
  Jar,
  mix,
  Pop,
  poseAt,
  Scene,
  Slide,
  speaking,
  Stick,
  streamCues,
  Tag,
  TitleCard,
  TV,
  Txt,
} from "#engine";
import { T, sceneProps } from "../timing";

const L = T.lines("way4");
const within = (f: number, a: number, b: number) => f >= a && f < b;

export const Way4: React.FC = () => {
  const f = useCurrentFrame();

  const sx = f < L.floor.start ? 300 : f < L.skill.start ? 960 : f < L.use.start ? 420 : f < L.trap.start ? 330 : f < L.half.start ? 420 : 960;

  const pose = poseAt(f, [
    [0, "stand"],
    [L.floor.start, "pointL"],
    [L.floor.start + 110, "pointUpR"],
    [L.skill.start, "sit"],
    [L.skill.start + 10, { la: [-50, -80], ra: [50, 80], ll: [-80, 80], rl: [80, -80], lean: 0, head: 12, bob: 62 }],
    [L.tenmin.start, "present"],
    [L.use.start, "present"],
    [L.trap.start, "cheer"],
    [L.trap.start + 70, "shrug"],
    [L.half.start, "hold"],
    [L.half.start + 120, "cheer"],
  ]);
  const h = hands(pose);
  const expr = within(f, L.trap.start + 70, L.half.start) ? "worried" : "smile";

  const doorAt = [L.use.start + 25, L.use.start + 100, L.use.start + 165];
  const level = ease(f, L.skill.start + 30, 120);
  const ticks = Math.floor(ease(f, L.tenmin.start + 15, 140, (x) => x) * 35);

  const sfx: Cue[] = [
    [18, "whoosh", 0.4],
    [20, "pop", 0.4],
    [L.floor.start + 30, "thud", 0.6],
    [L.floor.start + 110, "whoosh", 0.45],
    [L.skill.start + 10, "pop", 0.35],
    [L.skill.start + 150, "ding", 0.4],
    ...Array.from({ length: 12 }, (_, i) => [L.tenmin.start + 15 + i * 12, "tick", 0.25] as Cue),
    [L.tenmin.start + 160, "pop", 0.4],
    ...doorAt.map((d) => [d, "whoosh", 0.35] as Cue),
    [L.trap.start + 10, "pop", 0.35],
    [L.trap.start + 45, "pop", 0.4],
    [L.trap.start + 70, "pop", 0.4],
    [L.half.start + 20, "pop", 0.4],
    ...streamCues(L.half.start + 50, 3, 8, 18),
    ...streamCues(L.half.start + 75, 3, 8, 18),
    [L.half.start + 140, "ding", 0.35],
  ];

  return (
    <Scene {...sceneProps("way4")} sfx={sfx}>
      {/* cutting has a floor, earning has no ceiling */}
      {within(f, L.floor.start, L.skill.start + 10) && (
        <g opacity={1 - ease(f, L.skill.start - 6, 12)}>
          <Txt x={480} y={180} size={60} font="display" color={C.red}>
            CUTTING COSTS
          </Txt>
          <Draw at={L.floor.start} dur={10} d="M 220 700 L 740 700" width={12} color={C.ink} />
          {[260, 340, 420, 500, 580, 660].map((x) => (
            <path key={x} d={`M ${x} 700 L ${x - 30} 740`} stroke={C.ink} strokeWidth={5} opacity={ease(f, L.floor.start + 5, 10)} />
          ))}
          <Arrow at={L.floor.start + 12} x1={480} y1={260} x2={480} y2={ mix(f, [L.floor.start + 12, L.floor.start + 30], [300, 680])} bend={0} color={C.red} width={12} />
          <Pop at={L.floor.start + 30} x={480} y={780}>
            <Txt x={0} y={0} size={44} font="display">
              FLOOR
            </Txt>
          </Pop>
          <Txt x={1440} y={760} size={60} font="display" color={C.green} opacity={ease(f, L.floor.start + 100, 10)}>
            EARNING
          </Txt>
          {f >= L.floor.start + 105 && (
            <g transform={`translate(0 ${-ease(f, L.floor.start + 105, 30) * 900})`}>
              <path d="M 1440 680 L 1440 380 M 1390 430 L 1440 370 L 1490 430" stroke={C.green} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          <Pop at={L.floor.start + 130} x={1440} y={420}>
            <Txt x={0} y={0} size={44} font="display">
              NO CEILING
            </Txt>
          </Pop>
        </g>
      )}

      {/* invest in yourself */}
      {within(f, L.skill.start, L.use.start + 10) && (
        <g opacity={1 - ease(f, L.use.start - 6, 12)}>
          {f < L.tenmin.start + 6 && (
            <g opacity={1 - ease(f, L.tenmin.start - 6, 10)}>
              <Book x={sx + (h.l[0] + h.r[0]) * 0.675} y={GROUND + (h.l[1] + h.r[1]) * 0.675} scale={1.1} />
            </g>
          )}
          <g opacity={ease(f, L.skill.start + 15, 10) * (1 - ease(f, L.tenmin.start - 6, 10))}>
            <Txt x={1000} y={240} size={50} font="display" anchor="end">
              SKILL
            </Txt>
            <rect x={1030} y={215} width={560} height={50} rx={25} fill={C.paperDark} stroke={C.ink} strokeWidth={5} />
            <rect x={1030} y={215} width={560 * level} height={50} rx={25} fill={C.gold} stroke={C.ink} strokeWidth={5} />
            {level >= 1 && (
              <Pop at={L.skill.start + 150} x={1310} y={330}>
                <Tag x={0} y={0} text="LEVEL UP" font="display" size={48} fill={C.goldLight} />
              </Pop>
            )}
          </g>
          {f >= L.tenmin.start && (
            <g opacity={ease(f, L.tenmin.start, 10)}>
              {Array.from({ length: 35 }, (_, i) => {
                const cx = 860 + (i % 7) * 100;
                const cy = 400 + Math.floor(i / 7) * 80;
                return (
                  <g key={i}>
                    <rect x={cx - 40} y={cy - 32} width={80} height={64} rx={8} fill={C.white} stroke={C.ink} strokeWidth={4} />
                    {i < ticks && <path d={`M ${cx - 16} ${cy} L ${cx - 4} ${cy + 14} L ${cx + 18} ${cy - 14}`} stroke={C.green} strokeWidth={7} fill="none" strokeLinecap="round" />}
                  </g>
                );
              })}
              <Pop at={L.tenmin.start + 160} x={1160} y={850}>
                <Tag x={0} y={0} text="10 min a day = 60+ hours a year" size={44} fill={C.goldLight} />
              </Pop>
            </g>
          )}
        </g>
      )}

      {/* three doors */}
      {within(f, L.use.start, L.trap.start + 10) && (
        <g opacity={1 - ease(f, L.trap.start - 6, 12)}>
          {[
            { x: 820, label: "RAISE", color: C.green },
            { x: 1200, label: "NEW JOB", color: C.blue },
            { x: 1580, label: "SIDE PROJECT", color: C.gold },
          ].map((d, i) => (
            <Pop key={d.label} at={L.use.start + 5 + i * 8} x={d.x} y={GROUND}>
              <Door label={d.label} color={d.color} open={ease(f, doorAt[i], 14)} scale={1.1} />
            </Pop>
          ))}
          <Slide at={L.use.start + 30} from={[0, 20]} x={sx + 150} y={GROUND - 420}>
            <Tag x={0} y={0} text="with proof" size={38} fill={C.white} rotate={-5} />
          </Slide>
        </g>
      )}

      {/* lifestyle creep */}
      {within(f, L.trap.start, L.half.start + 10) && (
        <g opacity={1 - ease(f, L.half.start - 6, 12)}>
          <Txt x={860} y={180} size={44} font="display" color={C.green}>
            INCOME
          </Txt>
          <rect x={800} y={GROUND - mix(f, [L.trap.start + 10, L.trap.start + 40], [100, 520])} width={120} height={mix(f, [L.trap.start + 10, L.trap.start + 40], [100, 520])} fill={C.green} stroke={C.ink} strokeWidth={6} rx={6} />
          <Pop at={L.trap.start + 45} x={1180} y={GROUND}>
            <TV w={300} />
          </Pop>
          <Pop at={L.trap.start + 70} x={1560} y={GROUND}>
            <Car fancy color={C.gold} scale={1.2} />
          </Pop>
          <Pop at={L.trap.start + 90} x={1360} y={300}>
            <Txt x={0} y={0} size={56} font="display" color={C.red}>
              SPENDING SNEAKS UP
            </Txt>
          </Pop>
          <Pop at={L.trap.start + 100} x={1720} y={GROUND - 260}>
            <Tag x={0} y={0} text="saved: $0" size={36} fill={C.redLight} />
          </Pop>
        </g>
      )}

      {/* bank at least half of every raise */}
      {f >= L.half.start && (
        <g>
          <Pop at={L.half.start + 20} x={960} y={300}>
            <Tag x={0} y={0} text="RAISE" font="display" size={60} fill={C.goldLight} />
          </Pop>
          <Arrow at={L.half.start + 35} x1={880} y1={360} x2={560} y2={540} color={C.green} />
          <Arrow at={L.half.start + 35} x1={1040} y1={360} x2={1360} y2={540} bend={-40} color={C.blue} />
          <Pop at={L.half.start + 40} x={480} y={GROUND}>
            <Jar label="SAVE+INVEST" color={C.green} w={200} fill={0.55 * ease(f, L.half.start + 68, 20)} scale={1.2} />
          </Pop>
          <Pop at={L.half.start + 45} x={1440} y={GROUND}>
            <Jar label="LIFE" color={C.blueLight} w={200} fill={0.55 * ease(f, L.half.start + 93, 20)} scale={1.2} />
          </Pop>
          <CoinStream at={L.half.start + 50} from={[960, 330]} to={[480, GROUND - 250]} n={3} every={8} />
          <CoinStream at={L.half.start + 75} from={[960, 330]} to={[1440, GROUND - 250]} n={3} every={8} />
          <Pop at={L.half.start + 140} x={960} y={160}>
            <Txt x={0} y={0} size={50} font="display">
              LIVE A LITTLE BETTER, NOT A LOT
            </Txt>
          </Pop>
        </g>
      )}

      <Stick x={sx} y={GROUND} scale={1.35} pose={pose} expr={expr} talking={speaking(f, L)} />

      <TitleCard n={4} title="GROW YOUR INCOME" sub="then guard it" start={0} end={L.floor.start - 15} color={C.gold} />
    </Scene>
  );
};
