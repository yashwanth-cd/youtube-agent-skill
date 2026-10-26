import React from "react";
import { useCurrentFrame } from "remotion";
import {
  C,
  Calendar,
  CashStack,
  Cue,
  ease,
  Envelope,
  FlyCoin,
  GROUND,
  hands,
  mix,
  Pop,
  pop,
  poseAt,
  Scene,
  speaking,
  Stamp,
  Stick,
  Tag,
  Txt,
} from "#engine";
import { T, sceneProps } from "../timing";

const L = T.lines("hook");

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const w = L.where.start;
  const grabs = [w + 10, w + 50, w + 95];
  const sx = 760;

  const pose = poseAt(f, [
    [0, "stand"],
    [18, "hold"],
    [52, "cheer", 8],
    [80, "hold"],
    [w + 135, "shrug"],
    [L.salary.start - 6, "sad"],
    [L.five.start, "pointUpR"],
  ]);
  const h = hands(pose);
  const holdX = sx + (h.l[0] + h.r[0]) / 2;
  const holdY = GROUND + (h.l[1] + h.r[1]) / 2;
  const stack = 5 - grabs.filter((g) => f >= g + 18).length * 2 + (f >= grabs[2] + 18 ? 1 : 0);
  const expr = f < w + 100 ? "grin" : f < L.five.start ? "worried" : "smile";

  // the envelope falls into his hands, then becomes cash
  const drop = mix(f, [6, 26], [-200, holdY - 40]);
  const isCash = f >= 46;

  // calendar flips from day 1 to day 21 during the first line
  const day = Math.round(mix(f, [70, 112], [1, 21]));

  const sfx: Cue[] = [
    [24, "whoosh", 0.35],
    [46, "pop", 0.5],
    [52, "ding", 0.35],
    ...Array.from({ length: 8 }, (_, i) => [72 + i * 5, "tick", 0.3] as Cue),
    ...grabs.map((g) => [g, "whoosh", 0.3] as Cue),
    [w + 150, "pop", 0.3],
    [L.salary.start, "thud", 0.7],
    ...[0, 1, 2, 3, 4].map((i) => [L.five.start + 20 + i * 9, "pop", 0.35] as Cue),
    [L.five.start + 85, "ding", 0.3],
  ];

  const bins = [
    { label: "RENT", x: 1480, y: 330, fill: C.redLight },
    { label: "FOOD", x: 1560, y: 520, fill: C.goldLight },
    { label: "SUBSCRIPTIONS", x: 1440, y: 700, fill: C.blueLight },
  ];

  return (
    <Scene {...sceneProps("hook")} sfx={sfx}>
      {/* calendar */}
      {f < L.salary.start && (
        <g opacity={1 - ease(f, L.salary.start - 10, 10)}>
          <Pop at={62} x={1250} y={330}>
            <Calendar label={`${day}`} sub="DAY" />
          </Pop>
        </g>
      )}

      {/* the bills that take the money */}
      {f < L.salary.start &&
        bins.map((b, i) => (
          <Pop key={b.label} at={grabs[i] - 8} x={b.x} y={b.y} out={L.salary.start - 10}>
            <Tag x={0} y={0} text={b.label} fill={b.fill} font="display" size={40} />
          </Pop>
        ))}
      {grabs.map((g, i) =>
        [0, 1].map((k) => (
          <FlyCoin key={`${i}${k}`} at={g + k * 5} from={[holdX, holdY - 40]} to={[bins[i].x - 40, bins[i].y]} dur={18} arc={120} />
        )),
      )}

      <Stick x={sx} y={GROUND} scale={1.25} pose={pose} expr={expr} talking={speaking(f, L) && f > w + 100 && f < L.salary.start} />

      {/* what he is holding */}
      {!isCash && <Envelope x={holdX} y={drop} scale={0.55} rotate={mix(f, [6, 26], [-25, 0])} />}
      {isCash && f < w + 130 && (
        <g transform={`translate(${holdX} ${holdY - 30}) scale(${0.6 * Math.min(1, pop(f, 46))})`}>
          <CashStack n={Math.max(0, stack)} />
        </g>
      )}

      {/* a moth flutters out of the empty hands */}
      {f > w + 135 && f < L.salary.start + 10 && (
        <g transform={`translate(${holdX + (f - w - 135) * 2.2} ${holdY - 60 - (f - w - 135) * 3})`}>
          <ellipse rx={6} ry={14} fill={C.inkSoft} />
          <ellipse cx={-14} cy={-4} rx={14} ry={9 * Math.abs(Math.sin(f * 0.8))} fill={C.paperDark} stroke={C.ink} strokeWidth={3} />
          <ellipse cx={14} cy={-4} rx={14} ry={9 * Math.abs(Math.sin(f * 0.8))} fill={C.paperDark} stroke={C.ink} strokeWidth={3} />
        </g>
      )}
      {f > w + 120 && f < L.salary.start && (
        <Txt x={sx + 200} y={GROUND - 420} size={90} font="display" opacity={ease(f, w + 120, 10)}>
          ?
        </Txt>
      )}

      <Stamp at={L.salary.start} x={960} y={250} text="IT'S NOT YOUR SALARY" size={76} out={L.five.start - 4} />

      {/* the five moves */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Pop key={i} at={L.five.start + 20 + i * 9} x={1120 + i * 150} y={300}>
          <circle r={58} fill={C.ink} opacity={0.15} cx={5} cy={6} />
          <circle r={58} fill={[C.green, C.red, C.blue, C.gold, C.green][i]} stroke={C.ink} strokeWidth={7} />
          <Txt x={0} y={6} size={70} color={C.white} font="display">
            {i + 1}
          </Txt>
        </Pop>
      ))}
      <Pop at={L.five.start + 85} x={1420} y={480} rotate={-6}>
        <Tag x={0} y={0} text="COST: $0" fill={C.greenLight} font="display" size={52} />
      </Pop>
    </Scene>
  );
};

