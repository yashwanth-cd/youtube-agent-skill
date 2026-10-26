import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Book,
  C,
  Car,
  Certificate,
  Clock,
  Coin,
  Cue,
  ease,
  GROUND,
  Hammock,
  Lemonade,
  MoneyTree,
  Pop,
  pop,
  poseAt,
  Scene,
  Shop,
  speaking,
  Stick,
  Tag,
  TitleCard,
  Txt,
  Zzz,
} from "#engine";
import { T, sceneProps } from "../timing";

const L = T.lines("way5");
const within = (f: number, a: number, b: number) => f >= a && f < b;

export const Way5: React.FC = () => {
  const f = useCurrentFrame();

  const sleeping = within(f, L.break.start, L.small.start);
  const sx = f < L.two.start ? 300 : f < L.hours.start ? 960 : f < L.break.start ? 560 : sleeping ? 0 : f < L.skills.start ? 380 : 760;

  const pose = poseAt(f, [
    [0, "stand"],
    [L.two.start, "pointL"],
    [L.two.start + 90, "pointR"],
    [L.examples.start + 160, "pointR"],
    [L.hours.start, "stand"],
    [L.hours.start + 60, "sad"],
    [L.small.start, "present"],
    [L.skills.start, "think"],
    [L.skills.start + 50, "pointUpR"],
  ]);

  const leftCoins = Array.from({ length: 4 }, (_, i) => {
    const t = ((f - L.two.start - 30 + i * 18) % 72) / 72;
    return f > L.two.start + 30 ? t : -1;
  });
  const tickHours = Math.max(0, Math.min(8, Math.floor((f - L.hours.start - 10) / 10)));
  const dropT = (k: number) => (((f - L.break.start - 20 + k * 25) % 50) / 50);
  const pile = Math.min(9, Math.max(0, Math.floor((f - L.break.start - 40) / 14)));

  const sfx: Cue[] = [
    [18, "whoosh", 0.4],
    [20, "pop", 0.4],
    [L.two.start + 10, "pop", 0.35],
    [L.two.start + 90, "pop", 0.35],
    [L.examples.start + 20, "thud", 0.4],
    [L.examples.start + 140, "pop", 0.35],
    [L.examples.start + 175, "pop", 0.35],
    [L.examples.start + 220, "pop", 0.35],
    ...Array.from({ length: 8 }, (_, i) => [L.hours.start + 20 + i * 10, "tick", 0.3] as Cue),
    [L.break.start + 10, "whoosh", 0.3],
    ...Array.from({ length: 5 }, (_, i) => [L.break.start + 40 + i * 25, "pop", 0.18] as Cue),
    [L.small.start + 10, "pop", 0.4],
    [L.small.start + 60, "pop", 0.4],
    [L.skills.start + 50, "ding", 0.4],
  ];

  return (
    <Scene {...sceneProps("way5")} sfx={sfx}>
      {/* takes money vs makes money */}
      {within(f, L.two.start, L.hours.start + 10) && (
        <g opacity={1 - ease(f, L.hours.start - 6, 12)}>
          <Pop at={L.two.start + 10} x={480} y={160}>
            <Tag x={0} y={0} text="TAKES MONEY" font="display" size={52} fill={C.redLight} />
          </Pop>
          <Pop at={L.two.start + 90} x={1440} y={160}>
            <Tag x={0} y={0} text="MAKES MONEY" font="display" size={52} fill={C.greenLight} />
          </Pop>
          <Pop at={L.two.start + 10} x={480} y={GROUND}>
            <Car color={C.red} scale={1.4} />
          </Pop>
          {leftCoins.map((t, i) =>
            t >= 0 ? <Coin key={i} x={400 + i * 40} y={GROUND - 200 - Math.sin(Math.PI * t) * 120 + t * 60} opacity={1 - t} scale={0.9} /> : null,
          )}
          <Pop at={L.examples.start + 20} x={700} y={420} rotate={-8}>
            <Tag x={0} y={0} text="loses value" size={42} fill={C.redLight} />
          </Pop>
          <Pop at={L.two.start + 90} x={1700} y={GROUND}>
            <MoneyTree scale={0.85} grow={Math.min(1, pop(f, L.two.start + 90))} />
          </Pop>
          <Pop at={L.examples.start + 140} x={1180} y={340}>
            <Certificate label="SHARES" scale={0.85} />
          </Pop>
          <Pop at={L.examples.start + 175} x={1240} y={GROUND}>
            <Shop scale={0.95} />
          </Pop>
          <Pop at={L.examples.start + 220} x={1440} y={520}>
            <Book scale={0.9} />
            <Txt x={0} y={80} size={34}>
              things you create
            </Txt>
          </Pop>
        </g>
      )}

      {/* hours for money */}
      {within(f, L.hours.start, L.break.start + 10) && (
        <g opacity={1 - ease(f, L.break.start - 6, 12)}>
          <Pop at={L.hours.start + 5} x={1080} y={420}>
            <Clock t={tickHours} scale={1.3} />
          </Pop>
          {Array.from({ length: tickHours }, (_, i) => (
            <Pop key={i} at={L.hours.start + 20 + i * 10} x={1300 + (i % 4) * 70} y={360 + Math.floor(i / 4) * 80}>
              <Coin />
            </Pop>
          ))}
          <Pop at={L.hours.start + 90} x={1080} y={650}>
            <Txt x={0} y={0} size={48} font="display" color={C.red}>
              1 HOUR = 1 PAY
            </Txt>
          </Pop>
        </g>
      )}

      {/* asleep in a hammock while the tree pays */}
      {within(f, L.break.start, L.small.start + 10) && (
        <g opacity={ease(f, L.break.start, 12) * (1 - ease(f, L.small.start - 6, 12))}>
          <Hammock x={560} y={GROUND} />
          <Stick x={720} y={GROUND - 128} rotate={-84} scale={1.1} pose={{ la: [-20, 10], ra: [30, 120], ll: [-4, 2], rl: [4, -2], lean: 0, head: 0 }} expr="sleep" seed={3} />
          <Zzz x={470} y={GROUND - 220} />
          <MoneyTree x={1450} y={GROUND} drop={dropT(0)} />
          <MoneyTree x={1450} y={GROUND} drop={dropT(1)} opacity={0} />
          {Array.from({ length: pile }, (_, i) => (
            <Coin key={i} x={1330 + (i % 5) * 52} y={GROUND - 22 - Math.floor(i / 5) * 40} />
          ))}
          <Pop at={L.break.start + 60} x={1000} y={200}>
            <Tag x={0} y={0} text="PAID WHILE YOU SLEEP" font="display" size={52} fill={C.greenLight} />
          </Pop>
        </g>
      )}

      {/* start small */}
      {within(f, L.small.start, L.skills.start + 10) && (
        <g opacity={1 - ease(f, L.skills.start - 6, 12)}>
          <Pop at={L.small.start + 10} x={900} y={500}>
            <Certificate label="1 SHARE" scale={1.3} />
          </Pop>
          <Pop at={L.small.start + 60} x={1450} y={GROUND}>
            <Lemonade scale={1.2} />
          </Pop>
          <Pop at={L.small.start + 70} x={1450} y={300}>
            <Txt x={0} y={0} size={42}>
              built on a weekend
            </Txt>
          </Pop>
        </g>
      )}

      {/* skills are an asset */}
      {f >= L.skills.start && (
        <g>
          {f >= L.skills.start + 50 && (
            <g transform={`translate(${760 + 120} ${GROUND - 470 - ease(f, L.skills.start + 50, 40) * 120}) scale(${pop(f, L.skills.start + 50)})`}>
              <path
                d="M 0 -60 L 17 -20 L 60 -18 L 26 10 L 38 52 L 0 28 L -38 52 L -26 10 L -60 -18 L -17 -20 Z"
                fill={C.gold}
                stroke={C.ink}
                strokeWidth={6}
                strokeLinejoin="round"
              />
            </g>
          )}
          <Pop at={L.skills.start + 60} x={1350} y={360}>
            <Tag x={0} y={0} text="SKILLS = ASSETS" font="display" size={56} fill={C.goldLight} />
          </Pop>
          <Pop at={L.skills.start + 100} x={1350} y={470}>
            <Txt x={0} y={0} size={42} color={C.inkSoft}>
              nobody can repossess what you know
            </Txt>
          </Pop>
        </g>
      )}

      {!sleeping && <Stick x={sx} y={GROUND} scale={1.35} pose={pose} expr={within(f, L.hours.start + 60, L.break.start) ? "worried" : "smile"} talking={speaking(f, L)} />}

      <TitleCard n={5} title="OWN THINGS THAT EARN" sub="while you sleep" start={0} end={L.two.start - 15} color={C.green} />
    </Scene>
  );
};
