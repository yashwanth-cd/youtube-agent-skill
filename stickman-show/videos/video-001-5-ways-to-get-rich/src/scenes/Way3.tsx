import React from "react";
import { useCurrentFrame } from "remotion";
import {
  BarChart,
  Basket,
  C,
  Clock,
  Cue,
  Draw,
  ease,
  FlyCoin,
  GROUND,
  Jar,
  lerp,
  Pop,
  poseAt,
  Scene,
  Slide,
  Snowball,
  speaking,
  Stamp,
  Stick,
  Tag,
  TitleCard,
  Txt,
  waving,
  Zzz,
} from "#engine";
import { T, sceneProps } from "../timing";

const L = T.lines("way3");
const within = (f: number, a: number, b: number) => f >= a && f < b;

// a bumpy but rising market line, as [x, y] points
const MARKET: [number, number][] = [
  [300, 720], [400, 690], [480, 700], [560, 640], [620, 690], [700, 600], [780, 620], [840, 540],
  [900, 610], [960, 660], [1040, 560], [1120, 500], [1180, 540], [1260, 430], [1320, 470], [1400, 380],
  [1460, 420], [1540, 320], [1620, 300], [1700, 240],
];

export const Way3: React.FC = () => {
  const f = useCurrentFrame();

  // the characters' block: me, larry, the assumption and the results
  const charsIn = L.me.start;
  const charsOut = L.index.start;
  const sx = f < charsIn ? 220 : f < charsOut ? 330 : f < L.match.start ? 420 : f < L.hold.start ? 640 : 0;

  const pose = poseAt(f, [
    [0, "stand"],
    [L.compound.start, "pointR"],
    [L.me.start, "stand"],
    [L.me.start + 30, "hold"],
    [L.larry.start, "pointR"],
    [L.assume.start, "think"],
    [L.larryResult.start, "stand"],
    [L.meResult.start + 120, "cheer"],
    [L.time.start, "present"],
    [L.index.start, "present"],
    [L.match.start, "hold"],
  ]);
  const stickPose = within(f, L.me.start, L.me.start + 30) ? waving(pose, f) : pose;

  const larryPose = poseAt(f, [
    [0, "stand"],
    [L.larry.start + 10, "stand"],
    [L.larry.start + 80, "relaxed"],
    [L.larryResult.start, "hips"],
    [L.meResult.start + 120, "shock"],
    [L.time.start + 40, "shrug"],
  ]);
  const larryWave = within(f, L.larry.start + 10, L.larry.start + 50) ? waving(larryPose, f) : larryPose;

  // compounding snowball rolls down the hill
  const roll = ease(f, L.compound.start + 5, 110, (x) => x * x);
  const hill = { x1: 420, y1: 360, x2: 1820, y2: GROUND };
  const ballR = lerp(18, 120, roll);
  const ang = Math.atan2(hill.y2 - hill.y1, hill.x2 - hill.x1);
  const bx = lerp(hill.x1, hill.x2 - 160, roll) + Math.sin(ang) * ballR;
  const by = lerp(hill.y1, hill.y2 - 160 * Math.tan(ang), roll) - Math.cos(ang) * ballR;

  // results bars
  const larryVal = 244 * ease(f, L.larryResult.start + 40, 60);
  const meVal = 525 * ease(f, L.meResult.start + 90, 70);

  // retirement match
  const myCoin = L.match.start + 40;
  const bossCoin = L.match.start + 110;

  // market line drawn on
  const draw = ease(f, L.hold.start + 5, 150, (x) => x);
  const n = Math.max(2, Math.ceil(draw * (MARKET.length - 1)) + 1);
  const pts = MARKET.slice(0, n);
  const seg = draw * (MARKET.length - 1);
  const i0 = Math.min(MARKET.length - 2, Math.floor(seg));
  const tip: [number, number] = [
    lerp(MARKET[i0][0], MARKET[i0 + 1][0], seg - i0),
    lerp(MARKET[i0][1], MARKET[i0 + 1][1], seg - i0),
  ];
  if (pts.length) pts[pts.length - 1] = tip;

  const sfx: Cue[] = [
    [18, "whoosh", 0.4],
    [20, "pop", 0.4],
    [L.compound.start + 5, "whoosh", 0.3],
    [L.compound.start + 40, "pop", 0.3],
    [L.compound.start + 80, "pop", 0.3],
    [L.me.start + 40, "pop", 0.4],
    [L.larry.start + 5, "pop", 0.4],
    [L.larry.start + 55, "pop", 0.35],
    [L.assume.start + 5, "pop", 0.4],
    [L.larryResult.start + 40, "whoosh", 0.3],
    [L.larryResult.start + 100, "pop", 0.35],
    [L.meResult.start + 90, "whoosh", 0.35],
    [L.meResult.start + 160, "ding", 0.45],
    [L.time.start + 20, "thud", 0.6],
    [L.index.start + 5, "pop", 0.4],
    ...Array.from({ length: 7 }, (_, i) => [L.index.start + 40 + i * 12, "pop", 0.2] as Cue),
    [myCoin + 18, "pop", 0.4],
    [bossCoin + 18, "pop", 0.4],
    [bossCoin + 30, "ding", 0.35],
    [L.hold.start + 60, "pop", 0.3],
    [L.hold.start + 100, "pop", 0.3],
    [L.hold.start + 140, "pop", 0.3],
    [L.hold.start + 165, "ding", 0.3],
  ];

  return (
    <Scene {...sceneProps("way3")} sfx={sfx}>
      {/* compounding */}
      {within(f, L.compound.start, L.me.start + 10) && (
        <g opacity={1 - ease(f, L.me.start - 6, 12)}>
          <Draw at={L.compound.start} dur={20} d={`M ${hill.x1 - 120} ${hill.y1 - 20} L ${hill.x1} ${hill.y1} L ${hill.x2} ${hill.y2}`} width={7} />
          <Snowball x={bx} y={by} r={ballR} spin={roll * 900} />
          <Pop at={L.compound.start + 10} x={560} y={240}>
            <Tag x={0} y={0} text="your money" size={40} />
          </Pop>
          <Pop at={L.compound.start + 40} x={960} y={330}>
            <Tag x={0} y={0} text="+ what it earns" size={40} fill={C.greenLight} />
          </Pop>
          <Pop at={L.compound.start + 80} x={1360} y={420}>
            <Tag x={0} y={0} text="+ what THAT earns" size={40} fill={C.goldLight} />
          </Pop>
        </g>
      )}

      {/* me vs larry */}
      {within(f, charsIn, charsOut + 10) && (
        <g opacity={1 - ease(f, charsOut - 8, 14)}>
          <Pop at={L.me.start + 40} x={330} y={230}>
            <Tag x={0} y={-40} text="ME" font="display" size={44} fill={C.greenLight} />
            <Txt x={0} y={30} size={36}>
              $200/month from 25
            </Txt>
          </Pop>
          <Pop at={L.larry.start + 5} x={1620} y={230}>
            <Tag x={0} y={-40} text="LARRY" font="display" size={44} fill={C.blueLight} />
            <Txt x={0} y={30} size={36}>
              $200/month from 35
            </Txt>
          </Pop>
          {within(f, L.larry.start + 60, L.assume.start + 30) && (
            <g opacity={ease(f, L.larry.start + 60, 10) * (1 - ease(f, L.assume.start + 10, 10))}>
              <Zzz x={1680} y={GROUND - 400} />
              <Txt x={1330} y={GROUND - 300} size={38} color={C.inkSoft}>
                (waits 10 years)
              </Txt>
            </g>
          )}
          {/* the assumption */}
          {within(f, L.assume.start, L.larryResult.start + 10) && (
            <g opacity={1 - ease(f, L.larryResult.start - 6, 12)}>
              <Pop at={L.assume.start + 5} x={960} y={330}>
                <Tag x={0} y={0} text="ASSUMED: 7% A YEAR, ON AVERAGE" font="display" size={46} fill={C.goldLight} />
              </Pop>
              <Slide at={L.assume.start + 80} from={[0, 20]} x={960} y={430}>
                <Txt x={0} y={0} size={42} color={C.inkSoft}>
                  an assumption, not a promise
                </Txt>
              </Slide>
              <Draw
                at={L.assume.start + 140}
                dur={40}
                d="M 760 640 L 820 600 L 860 650 L 920 560 L 970 620 L 1030 540 L 1080 600 L 1160 500"
                color={C.blue}
                width={8}
              />
            </g>
          )}
          {/* results */}
          {f >= L.larryResult.start && (
            <g opacity={ease(f, L.larryResult.start, 12)}>
              <Txt x={960} y={150} size={50} font="display" opacity={1 - ease(f, L.time.start + 10, 8)}>
                AT 65
              </Txt>
              <BarChart
                x={720}
                y={GROUND}
                gap={360}
                max={525}
                h={470}
                bars={[
                  { value: meVal, color: C.green, label: "ME", top: meVal > 520 ? "~$525K" : undefined, under: f > L.meResult.start + 40 ? "put in $96K" : undefined },
                  { value: larryVal, color: C.blue, label: "LARRY", top: larryVal > 240 ? "~$244K" : undefined, under: f > L.larryResult.start + 100 ? "put in $72K" : undefined },
                ]}
              />
            </g>
          )}
          <Stamp at={L.time.start + 20} x={960} y={140} text="THE DIFFERENCE WAS TIME" color={C.green} size={62} rotate={-4} />
          {f >= L.time.start + 20 && <Clock x={1410} y={420} t={f / 20} scale={0.6} />}
          <Stick x={1620} y={GROUND} scale={1.35} pose={larryWave} color={C.blue} accessory="glasses" seed={5} expr={f > L.meResult.start + 120 ? "o" : "smug"} opacity={ease(f, L.larry.start, 10)} />
        </g>
      )}

      {/* index fund */}
      {within(f, L.index.start, L.match.start + 10) && (
        <g opacity={1 - ease(f, L.match.start - 6, 12)}>
          <Pop at={L.index.start + 5} x={1150} y={GROUND - 30}>
            <Basket count={Math.min(14, Math.floor(ease(f, L.index.start + 30, 90, (x) => x) * 14))} scale={1.5} />
          </Pop>
          <Slide at={L.index.start + 90} from={[0, 20]} x={1150} y={260}>
            <Txt x={0} y={0} size={52} font="display">
              A TINY SLICE OF HUNDREDS
            </Txt>
          </Slide>
        </g>
      )}

      {/* employer match */}
      {within(f, L.match.start, L.hold.start + 10) && (
        <g opacity={1 - ease(f, L.hold.start - 6, 12)}>
          <Pop at={L.match.start + 5} x={1000} y={GROUND}>
            <Jar label="RETIREMENT" color={C.green} fill={0.15 + 0.2 * ease(f, myCoin + 18, 10) + 0.2 * ease(f, bossCoin + 18, 10)} scale={1.3} w={190} />
          </Pop>
          <FlyCoin at={myCoin} from={[740, 560]} to={[1000, GROUND - 260]} dur={18} arc={120} />
          <FlyCoin at={bossCoin} from={[1260, 560]} to={[1000, GROUND - 260]} dur={18} arc={120} />
          <Stick x={1360} y={GROUND} scale={1.35} pose={poseAt(f, [[0, "stand"], [bossCoin - 20, "hold"], [bossCoin + 30, "present"]])} accessory="tie" seed={9} expr="smile" opacity={ease(f, L.match.start + 20, 10)} />
          <Pop at={bossCoin + 30} x={1000} y={240}>
            <Tag x={0} y={0} text="EMPLOYER MATCH" font="display" size={56} fill={C.greenLight} />
          </Pop>
          <Pop at={bossCoin + 50} x={1000} y={330}>
            <Txt x={0} y={0} size={40} color={C.inkSoft}>
              take the full match first
            </Txt>
          </Pop>
        </g>
      )}

      {/* stay on the hill */}
      {f >= L.hold.start && (
        <g>
          <path d={`M ${pts.map((p) => p.join(" ")).join(" L ")}`} stroke={C.green} strokeWidth={12} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <Stick x={tip[0]} y={tip[1]} scale={0.8} pose={poseAt(f, [[0, "hold"], [L.hold.start + 130, "cheer"]])} expr={draw < 0.5 ? "flat" : "smile"} />
          {[
            ["keep fees low", 60],
            ["keep adding", 100],
            ["don't panic sell", 140],
          ].map(([t, d], i) => (
            <Pop key={t} at={L.hold.start + (d as number)} x={420} y={200 + i * 80}>
              <path d="M -10 0 L 4 14 L 30 -16" stroke={C.green} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <Txt x={50} y={0} size={48} anchor="start">
                {t}
              </Txt>
            </Pop>
          ))}
          <Pop at={L.hold.start + 165} x={1400} y={720}>
            <Tag x={0} y={0} text="STAY ON THE HILL" font="display" size={56} fill={C.greenLight} />
          </Pop>
        </g>
      )}

      {f < L.hold.start && <Stick x={sx} y={GROUND} scale={1.35} pose={stickPose} talking={speaking(f, L)} expr="smile" />}

      <TitleCard n={3} title="INVEST EARLY" sub="let time do the heavy lifting" start={0} end={L.compound.start - 15} color={C.blue} />
    </Scene>
  );
};
