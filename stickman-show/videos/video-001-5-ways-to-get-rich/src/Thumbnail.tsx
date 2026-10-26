import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Coin, Jar, Stage, Stick, Txt } from "#engine";

/**
 * The thumbnail brief from /yt-package: three words that do not repeat the title, one big
 * expression, high contrast at feed size. Title: "5 Ways to Get Rich on a Normal Salary".
 */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill>
    <Stage bg={C.goldLight}>
      <rect x={0} y={860} width={1920} height={220} fill={C.green} />
      <Txt x={1290} y={230} size={230} font="display" color={C.ink}>
        NO LUCK
      </Txt>
      <Txt x={1290} y={450} size={230} font="display" color={C.green}>
        NEEDED
      </Txt>
      <Jar x={1290} y={930} label="SAVINGS" color={C.green} fill={0.85} scale={1.3} w={220} />
      {[
        [1080, 820],
        [1500, 830],
        [1110, 710],
        [1470, 715],
      ].map(([x, y], i) => (
        <Coin key={i} x={x} y={y} scale={1.6} rotate={i * 25} />
      ))}
      <Stick
        x={430}
        y={960}
        scale={2.6}
        pose={{ la: [-150, -15], ra: [150, 15], ll: [-16, 6], rl: [16, -6], lean: 0, head: 0 }}
        expr="grin"
        seed={2}
      />
    </Stage>
  </AbsoluteFill>
);
