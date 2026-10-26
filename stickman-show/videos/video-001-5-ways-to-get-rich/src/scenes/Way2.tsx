import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Arrow,
  Bathtub,
  Bill,
  Bucket,
  C,
  Car,
  CoinStream,
  CreditCard,
  CrossOut,
  Cue,
  Draw,
  ease,
  FlyCoin,
  GROUND,
  Hammer,
  hands,
  Jar,
  mix,
  Monster,
  Pop,
  pop,
  poseAt,
  Scene,
  Slide,
  Snowball,
  speaking,
  Stick,
  streamCues,
  Tag,
  TitleCard,
  Txt,
  walking,
} from "#engine";
import { T, sceneProps } from "../timing";

const L = T.lines("way2");
// highest rate on the left, so the snowball rolls left to right
const CARDS = [
  { x: 620, rate: "27%", color: C.red },
  { x: 960, rate: "18%", color: C.blue },
  { x: 1300, rate: "9%", color: C.green },
];

const within = (f: number, a: number, b: number) => f >= a && f < b;

export const Way2: React.FC = () => {
  const f = useCurrentFrame();

  // stick position: mostly left, walks to the tap during "stop"
  const stopWalk = [L.stop.start + 30, L.stop.start + 90];
  let sx = 380;
  if (f >= L.bucket.start && f < L.example.start) sx = 760;
  if (f >= L.stop.start && f < L.emergency.start) sx = mix(f, stopWalk, [500, 980]);
  if (f >= L.emergency.start) sx = 860;
  const walkingNow = f >= stopWalk[0] && f < stopWalk[1];

  const base = poseAt(f, [
    [0, "stand"],
    [L.bucket.start, "holdHigh"],
    [L.bucket.end - 20, "shrug"],
    [L.example.start, "present"],
    [L.nothing.start, "facepalm"],
    [L.list.start, "pointR"],
    [L.list.start + 140, "cheer"],
    [L.roll.start, "pointR"],
    [L.choice.start, "present"],
    [L.stop.start, "stand"],
    [stopWalk[1], "pointUpR"],
    [stopWalk[1] + 40, "hips"],
    [L.emergency.start, "present"],
    [L.emergency.start + 120, "cheer"],
  ]);
  const pose = walkingNow ? walking(base, f * 0.32) : base;
  const h = hands(pose);
  const expr = within(f, L.bucket.start + 80, L.example.start) || within(f, L.nothing.start, L.list.start) ? "worried" : "smile";

  // debt list
  const highlightAt = L.list.start + 100;
  const smashAt = L.list.start + 150;
  const rollStart = L.roll.start + 10;
  const rollEnd = L.roll.start + 110;
  const ballX = mix(f, [rollStart, rollEnd], [CARDS[0].x, CARDS[2].x + 380]);
  const ballR = mix(f, [rollStart, rollEnd], [34, 90]);
  const cardGone = (i: number) => (i === 0 ? smashAt + 6 : rollStart + ((CARDS[i].x - CARDS[0].x) / (CARDS[2].x + 380 - CARDS[0].x)) * (rollEnd - rollStart));

  const tapOffAt = stopWalk[1] + 10;
  const fixAt = L.emergency.start + 90;

  const sfx: Cue[] = [
    [18, "whoosh", 0.4],
    [20, "pop", 0.4],
    [L.bucket.start + 10, "pop", 0.35],
    [L.example.start + 10, "pop", 0.35],
    [L.example.start + 90, "pop", 0.35],
    [L.example.start + 200, "thud", 0.5],
    [L.nothing.start + 5, "pop", 0.35],
    ...[0, 1, 2, 3].map((i) => [L.nothing.start + 20 + i * 10, "whoosh", 0.2] as Cue),
    ...CARDS.map((_, i) => [L.list.start + 10 + i * 8, "pop", 0.35] as Cue),
    ...streamCues(L.list.start + 50, 3, 6, 16, "pop", 0.2),
    [highlightAt, "ding", 0.3],
    [smashAt, "thud", 0.8],
    [cardGone(1), "thud", 0.5],
    [cardGone(2), "thud", 0.5],
    [L.choice.start + 120, "pop", 0.4],
    [tapOffAt, "tick", 0.6],
    [L.emergency.start + 10, "pop", 0.35],
    ...streamCues(L.emergency.start + 60, 3, 6, 20, "pop", 0.3),
    [fixAt, "ding", 0.4],
  ];

  return (
    <Scene {...sceneProps("way2")} sfx={sfx}>
      {/* leaky bucket */}
      {within(f, L.bucket.start, L.example.start + 10) && (
        <g opacity={1 - ease(f, L.example.start - 6, 12)}>
          <Pop at={L.bucket.start} x={1120} y={GROUND - 40}>
            <Bucket level={0.18 + 0.05 * Math.sin(f * 0.2)} scale={1.3} />
          </Pop>
          {f > L.bucket.start + 15 && (
            <path
              d={`M ${sx + h.r[0] * 1.35 + 30} ${GROUND + h.r[1] * 1.35} Q ${1030} ${GROUND - 500} ${1080} ${GROUND - 220}`}
              stroke={C.blue}
              strokeWidth={22}
              fill="none"
              strokeLinecap="round"
              opacity={0.7}
              strokeDasharray="40 18"
              strokeDashoffset={-f * 6}
            />
          )}
          <Slide at={L.bucket.start + 70} from={[0, 30]} x={1450} y={GROUND - 120}>
            <Tag x={0} y={0} text="DEBT" fill={C.redLight} font="display" size={44} />
          </Slide>
          <Arrow at={L.bucket.start + 75} x1={1370} y1={GROUND - 110} x2={1150} y2={GROUND - 30} color={C.red} bend={-30} />
        </g>
      )}

      {/* the example: 3,000 at 22% */}
      {within(f, L.example.start, L.nothing.start + 10) && (
        <g opacity={1 - ease(f, L.nothing.start - 6, 12)}>
          <Pop at={L.example.start + 5} x={960} y={150}>
            <Tag x={0} y={0} text="EXAMPLE" fill={C.goldLight} font="display" size={40} />
          </Pop>
          <Pop at={L.example.start + 10} x={800} y={430}>
            <CreditCard rate="22% / yr" color={C.blue} scale={1.3} />
          </Pop>
          <Pop at={L.example.start + 90} x={800} y={250}>
            <Txt x={0} y={0} size={80} font="display">
              $3,000
            </Txt>
          </Pop>
          <Arrow at={L.example.start + 160} x1={1000} y1={420} x2={1220} y2={420} bend={-40} />
          <Pop at={L.example.start + 200} x={1480} y={400}>
            <Txt x={0} y={-30} size={96} font="display" color={C.red}>
              $700+
            </Txt>
            <Txt x={0} y={50} size={44}>
              interest in one year
            </Txt>
          </Pop>
          <Slide at={L.example.start + 250} from={[0, 20]} x={1180} y={680}>
            <Txt x={0} y={0} size={36} color={C.inkSoft}>
              if you don't pay it down
            </Txt>
          </Slide>
        </g>
      )}

      {/* money feeding the interest monster */}
      {within(f, L.nothing.start, L.list.start + 10) && (
        <g opacity={1 - ease(f, L.list.start - 6, 12)}>
          <Pop at={L.nothing.start} x={1250} y={GROUND - 110}>
            <Monster open={0.5 + 0.5 * Math.sin(f * 0.5)} scale={1.25} />
          </Pop>
          {[0, 1, 2, 3].map((i) => {
            const t = ease(f, L.nothing.start + 20 + i * 10, 22, (x) => x);
            if (t <= 0 || t >= 1) return null;
            return <Bill key={i} x={mix(t, [0, 1], [520, 1240])} y={mix(t, [0, 1], [560, GROUND - 120]) - Math.sin(Math.PI * t) * 140} rotate={t * 300} />;
          })}
        </g>
      )}

      {/* list the debts, smash the most expensive, then snowball */}
      {within(f, L.list.start, L.choice.start + 10) && (
        <g opacity={1 - ease(f, L.choice.start - 6, 12)}>
          <Pop at={L.list.start + 5} x={960} y={150}>
            <Tag x={0} y={0} text="EXAMPLE RATES" fill={C.goldLight} font="display" size={36} />
          </Pop>
          {CARDS.map((c, i) => {
            const gone = cardGone(i);
            const g = ease(f, gone, 10);
            return (
              <Pop key={c.rate} at={L.list.start + 10 + i * 8} x={c.x} y={420 + g * 600}>
                <g transform={`rotate(${g * (i % 2 ? 40 : -40)})`} opacity={1 - g}>
                  <CreditCard rate={c.rate} color={c.color} highlight={i === 0 && f >= highlightAt} scale={1.1} />
                </g>
              </Pop>
            );
          })}
          <Txt x={960} y={650} size={40} color={C.inkSoft} opacity={ease(f, L.list.start + 50, 10) * (1 - ease(f, highlightAt, 10))}>
            minimum payment on every card
          </Txt>
          {CARDS.map((c, i) => (
            <FlyCoin key={i} at={L.list.start + 50 + i * 6} from={[sx + 100, 560]} to={[c.x, 420]} dur={16} arc={120} scale={0.8} />
          ))}
          <CoinStream at={highlightAt + 6} from={[sx + 100, 560]} to={[CARDS[0].x, 420]} n={3} every={4} dur={14} />
          {within(f, highlightAt + 20, smashAt + 25) && (
            <Hammer x={CARDS[0].x + 60} y={240} rotate={mix(f, [highlightAt + 20, smashAt - 6, smashAt], [40, 60, -40])} scale={1.1} />
          )}
          {within(f, rollStart, rollEnd + 20) && (
            <Snowball x={ballX} y={GROUND - ballR} r={ballR} spin={f * 12} />
          )}
          <Slide at={L.roll.start + 30} from={[0, 30]} x={960} y={720}>
            <Txt x={0} y={0} size={46} font="display" color={C.blue}>
              ROLL THE PAYMENT FORWARD
            </Txt>
          </Slide>
        </g>
      )}

      {/* two paths, one flag */}
      {within(f, L.choice.start, L.stop.start + 10) && (
        <g opacity={1 - ease(f, L.stop.start - 6, 12)}>
          <Draw at={L.choice.start + 10} dur={30} d="M 560 700 C 800 420, 1100 380, 1480 360" color={C.red} width={10} />
          <Draw at={L.choice.start + 40} dur={30} d="M 560 700 C 900 760, 1250 640, 1480 380" color={C.blue} width={10} />
          <Slide at={L.choice.start + 20} from={[0, 20]} x={880} y={400}>
            <Tag x={0} y={0} text="highest rate first" size={38} fill={C.redLight} rotate={-8} />
          </Slide>
          <Slide at={L.choice.start + 55} from={[0, 20]} x={1100} y={780}>
            <Tag x={0} y={0} text="smallest balance first" size={38} fill={C.blueLight} rotate={-4} />
          </Slide>
          <Pop at={L.choice.start + 120} x={1500} y={370}>
            <path d="M 0 0 L 0 -200" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
            <path d={`M 0 -200 Q 70 ${-185 + Math.sin(f * 0.3) * 8} 140 -170 L 0 -130 Z`} fill={C.green} stroke={C.ink} strokeWidth={5} />
            <Txt x={70} y={-250} size={48} font="display" color={C.green}>
              DEBT FREE
            </Txt>
          </Pop>
        </g>
      )}

      {/* stop adding debt: turn off the tap */}
      {within(f, L.stop.start, L.emergency.start + 10) && (
        <g opacity={1 - ease(f, L.emergency.start - 6, 12)}>
          <Pop at={L.stop.start} x={1250} y={GROUND}>
            <Bathtub running={f < tapOffAt} level={0.45 + (f < tapOffAt ? 0.1 * ease(f, L.stop.start, 100) : 0.1) - 0.15 * ease(f, tapOffAt + 10, 40)} scale={1.4} />
          </Pop>
          <Pop at={L.stop.start + 20} x={1250} y={300}>
            <Tag x={0} y={0} text="STOP ADDING NEW DEBT" fill={C.redLight} font="display" size={46} />
          </Pop>
          <Pop at={L.stop.start + 5} x={1440} y={GROUND - 380}>
            <Txt x={0} y={0} size={34} font="display" color={C.blue}>
              NEW DEBT
            </Txt>
          </Pop>
        </g>
      )}

      {/* the emergency fund */}
      {f >= L.emergency.start && (
        <g>
          <Pop at={L.emergency.start + 5} x={1380} y={GROUND}>
            <Car flat={f < fixAt} rotate={f < fixAt ? 3 : 0} scale={1.3} />
          </Pop>
          <Pop at={L.emergency.start + 10} x={480} y={GROUND}>
            <Jar label="EMERGENCY" color={C.gold} fill={0.75 - 0.25 * ease(f, L.emergency.start + 60, 30)} scale={1.2} w={170} />
          </Pop>
          <CoinStream at={L.emergency.start + 60} from={[480, GROUND - 240]} to={[1260, GROUND - 60]} n={3} dur={20} arc={260} />
          <Pop at={L.emergency.start + 40} x={1000} y={330}>
            <CreditCard color={C.blue} scale={0.8} />
          </Pop>
          <CrossOut at={L.emergency.start + 70} x={1000} y={330} size={80} />
          {f >= fixAt && (
            <g transform={`translate(1380 ${GROUND - 230}) scale(${pop(f, fixAt)})`}>
              <Txt x={0} y={0} size={60} font="display" color={C.green}>
                FIXED!
              </Txt>
            </g>
          )}
        </g>
      )}

      <Stick x={sx} y={GROUND} scale={1.35} pose={pose} expr={expr} talking={speaking(f, L)} />

      <TitleCard n={2} title="KILL HIGH-INTEREST DEBT" sub="stop the leak before you fill the bucket" start={0} end={L.bucket.start - 15} color={C.red} />
    </Scene>
  );
};
