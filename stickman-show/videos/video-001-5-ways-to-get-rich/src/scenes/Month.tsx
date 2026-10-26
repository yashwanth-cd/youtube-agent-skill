import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Basket,
  C,
  Calendar,
  CoinStream,
  Couch,
  CreditCard,
  CrossOut,
  Cue,
  ease,
  Envelope,
  FlyCoin,
  GROUND,
  hands,
  Jar,
  Phone,
  Pizza,
  Pop,
  poseAt,
  Scene,
  speaking,
  Stick,
  streamCues,
  Tag,
  TV,
  Txt,
  Zzz,
} from "#engine";
import { T, sceneProps } from "../timing";

const L = T.lines("month");
const within = (f: number, a: number, b: number) => f >= a && f < b;
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const Month: React.FC = () => {
  const f = useCurrentFrame();
  const sleeping = within(f, L.save.start, L.debt.start);
  const sitting = within(f, L.live.start, L.repeat.start);

  const pose = poseAt(f, [
    [0, "stand"],
    [L.intro.start, "hold"],
    [L.debt.start, "pointR"],
    [L.invest.start, "pointR"],
    [L.invest.start + 90, "hips"],
    [L.repeat.start, "present"],
    [L.repeat.start + 80, "cheer"],
  ]);
  const h = hands(pose);

  // months flip faster and faster
  const flipT = ease(f, L.repeat.start + 10, 100, (x) => x * x);
  const month = Math.min(11, Math.floor(flipT * 11.99));
  const smallCal = f >= L.save.start && f < L.repeat.start;

  const sfx: Cue[] = [
    [L.intro.start + 5, "pop", 0.4],
    [L.save.start + 20, "tick", 0.6],
    ...streamCues(L.save.start + 40, 4, 10, 22, "pop", 0.25),
    ...streamCues(L.debt.start + 30, 3, 6, 16, "pop", 0.2),
    ...streamCues(L.debt.start + 70, 4, 5, 16, "pop", 0.3),
    ...streamCues(L.invest.start + 20, 4, 8, 18, "pop", 0.25),
    [L.invest.start + 80, "thud", 0.35],
    [L.live.start + 10, "pop", 0.35],
    [L.live.start + 120, "ding", 0.3],
    ...Array.from({ length: 11 }, (_, i) => [L.repeat.start + 10 + Math.sqrt((i + 1) / 12) * 100, "tick", 0.35] as Cue),
  ];

  return (
    <Scene {...sceneProps("month")} sfx={sfx}>
      {/* payday */}
      {f < L.save.start + 10 && (
        <g opacity={1 - ease(f, L.save.start - 6, 12)}>
          <Pop at={L.intro.start + 5} x={1200} y={430}>
            <Calendar label="1" sub="PAYDAY" color={C.green} scale={1.5} />
          </Pop>
          <Envelope x={560 + (h.l[0] + h.r[0]) * 0.675} y={GROUND + (h.l[1] + h.r[1]) * 0.675 - 20} scale={0.6} opacity={ease(f, L.intro.start, 10)} />
        </g>
      )}
      {smallCal && (
        <g opacity={ease(f, L.save.start, 10)}>
          <Calendar x={150} y={170} label="1" sub="PAYDAY" color={C.green} scale={0.7} />
        </g>
      )}

      {/* auto transfer while asleep */}
      {within(f, L.save.start, L.debt.start + 10) && (
        <g opacity={1 - ease(f, L.debt.start - 6, 12)}>
          <Stick x={520} y={GROUND - 30} rotate={-86} scale={1.2} pose={{ la: [-10, 10], ra: [10, -10], ll: [-4, 2], rl: [4, -2], lean: 0, head: 0 }} expr="sleep" />
          <Zzz x={420} y={GROUND - 140} />
          <Pop at={L.save.start + 5} x={1000} y={450}>
            <Phone on={ease(f, L.save.start + 20, 8)} scale={0.9} />
          </Pop>
          <Pop at={L.save.start + 10} x={1500} y={GROUND}>
            <Jar label="SAVINGS" color={C.green} fill={0.2 + 0.4 * ease(f, L.save.start + 60, 50)} scale={1.3} />
          </Pop>
          <CoinStream at={L.save.start + 40} from={[1090, 380]} to={[1500, GROUND - 260]} n={4} every={10} dur={22} />
          <Pop at={L.save.start + 30} x={1240} y={180}>
            <Tag x={0} y={0} text="STEP 1: SAVE" font="display" size={52} fill={C.greenLight} />
          </Pop>
        </g>
      )}

      {/* debts */}
      {within(f, L.debt.start, L.invest.start + 10) && (
        <g opacity={1 - ease(f, L.invest.start - 6, 12)}>
          {[
            { x: 900, rate: "27%", color: C.red },
            { x: 1220, rate: "18%", color: C.blue },
            { x: 1540, rate: "9%", color: C.green },
          ].map((c, i) => (
            <Pop key={c.rate} at={L.debt.start + 5 + i * 6} x={c.x} y={500}>
              <CreditCard rate={c.rate} color={c.color} highlight={i === 0 && f > L.debt.start + 70} />
            </Pop>
          ))}
          {[900, 1220, 1540].map((x, i) => (
            <FlyCoin key={i} at={L.debt.start + 30 + i * 6} from={[600, 560]} to={[x, 500]} dur={16} arc={140} scale={0.8} />
          ))}
          <CoinStream at={L.debt.start + 70} from={[600, 560]} to={[900, 500]} n={4} every={5} dur={16} />
          <Pop at={L.debt.start + 20} x={1220} y={180}>
            <Tag x={0} y={0} text="STEP 2: DEBT" font="display" size={52} fill={C.redLight} />
          </Pop>
        </g>
      )}

      {/* invest, ignore the news */}
      {within(f, L.invest.start, L.live.start + 10) && (
        <g opacity={1 - ease(f, L.live.start - 6, 12)}>
          <Pop at={L.invest.start + 5} x={1060} y={GROUND - 20}>
            <Basket count={14} scale={1.1} />
          </Pop>
          <CoinStream at={L.invest.start + 20} from={[640, 540]} to={[1060, GROUND - 200]} n={4} every={8} />
          <Pop at={L.invest.start + 60} x={1620} y={GROUND}>
            <g transform={`rotate(${Math.sin(f * 1.3) * 2})`}>
              <TV w={340} text="MARKETS PANIC!" />
            </g>
          </Pop>
          <CrossOut at={L.invest.start + 110} x={1620} y={GROUND - 110} size={90} />
          <Pop at={L.invest.start + 15} x={1220} y={180}>
            <Tag x={0} y={0} text="STEP 3: INVEST" font="display" size={52} fill={C.blueLight} />
          </Pop>
        </g>
      )}

      {/* live on the rest */}
      {within(f, L.live.start, L.repeat.start + 10) && (
        <g opacity={ease(f, L.live.start, 10) * (1 - ease(f, L.repeat.start - 6, 12))}>
          <Couch x={900} y={GROUND} />
          <Stick x={900} y={GROUND - 40} scale={1.3} pose={{ la: [-30, -70], ra: [40, 110], ll: [80, -80], rl: [95, -95], lean: -3, head: 4, bob: 70 }} expr="grin" talking={speaking(f, L)} />
          <Pizza x={960} y={GROUND - 270} scale={0.6} rotate={-20} />
          <Pop at={L.live.start + 10} x={1460} y={360}>
            <Txt x={0} y={-40} size={52} font="display">
              RENT · FOOD · FUN
            </Txt>
          </Pop>
          <Pop at={L.live.start + 120} x={1460} y={460}>
            <Tag x={0} y={0} text="NO GUILT" font="display" size={56} fill={C.goldLight} />
          </Pop>
        </g>
      )}

      {/* again, and again */}
      {f >= L.repeat.start && (
        <g opacity={ease(f, L.repeat.start, 10)}>
          <Calendar x={960} y={360} label={MONTHS[month]} sub="PAYDAY" color={C.green} scale={1.3} rotate={Math.sin(f * 0.8) * (flipT < 1 ? 3 : 0)} />
          {[
            { x: 1400, label: "SAVED", color: C.green },
            { x: 1620, label: "INVESTED", color: C.blue },
          ].map((b, i) => {
            const bh = 60 + flipT * (i ? 380 : 300);
            return (
              <g key={b.label}>
                <rect x={b.x - 70} y={GROUND - bh} width={140} height={bh} rx={8} fill={b.color} stroke={C.ink} strokeWidth={6} />
                <Txt x={b.x} y={GROUND + 50} size={38} font="display">
                  {b.label}
                </Txt>
              </g>
            );
          })}
        </g>
      )}

      {!sleeping && !sitting && <Stick x={f < L.debt.start ? 560 : 480} y={GROUND} scale={1.35} pose={pose} talking={speaking(f, L)} expr="smile" />}
    </Scene>
  );
};
