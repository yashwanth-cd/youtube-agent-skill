import React from "react";
import { useCurrentFrame } from "remotion";
import {
  C,
  Cue,
  ease,
  Gear,
  GROUND,
  mix,
  Phone,
  Pop,
  poseAt,
  Scene,
  speaking,
  Stick,
  Tag,
  Txt,
  waving,
} from "#engine";
import { END_CARD, T, sceneProps } from "../timing";

const L = T.lines("close");

export const Close: React.FC = () => {
  const f = useCurrentFrame();
  const toggleAt = L.job.start + 95;
  const endAt = L.bye.end + 10;
  const sx = mix(f, [endAt, endAt + 25], [480, 300]);

  const pose = poseAt(f, [
    [0, "stand"],
    [L.job.start, "pointR"],
    [toggleAt + 40, "present"],
    [L.bye.start, "stand"],
  ]);
  const p = f >= L.bye.start ? waving(pose, f) : pose;

  const sfx: Cue[] = [
    [L.job.start + 10, "pop", 0.4],
    [toggleAt, "tick", 0.7],
    [toggleAt + 15, "ding", 0.4],
    [L.job.start + 150, "pop", 0.35],
    [endAt, "whoosh", 0.4],
    [endAt + 15, "pop", 0.4],
  ];

  return (
    <Scene {...sceneProps("close", END_CARD)} sfx={sfx}>
      {f < endAt + 10 && (
        <g opacity={1 - ease(f, endAt - 4, 12)}>
          <Pop at={L.job.start + 10} x={1080} y={470}>
            <Phone on={ease(f, toggleAt, 8)} />
          </Pop>
          <Pop at={L.job.start + 20} x={1500} y={460}>
            <Gear r={120} teeth={12} spin={Math.max(0, f - toggleAt) * 2.5} color={f >= toggleAt ? C.green : C.paperDark} />
            <Txt x={0} y={190} size={46} font="display">
              MOVE 1
            </Txt>
          </Pop>
          <Pop at={L.job.start + 150} x={1080} y={150}>
            <Tag x={0} y={0} text="ANY AMOUNT. TONIGHT." font="display" size={56} fill={C.goldLight} />
          </Pop>
        </g>
      )}

      {/* end card: room for YouTube's end-screen elements on the right */}
      {f >= endAt && (
        <g opacity={ease(f, endAt, 15)}>
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
          <Pop at={endAt + 15} x={1220} y={680}>
            <rect x={-200} y={-50} width={400} height={100} rx={20} fill={C.red} stroke={C.ink} strokeWidth={6} />
            <Txt x={0} y={4} size={52} font="display" color={C.white}>
              SUBSCRIBE
            </Txt>
          </Pop>
        </g>
      )}

      <Stick x={sx} y={GROUND} scale={1.35} pose={p} talking={speaking(f, L)} expr="grin" />
    </Scene>
  );
};
