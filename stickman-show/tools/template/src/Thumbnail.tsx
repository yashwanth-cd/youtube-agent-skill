import React from "react";
import { AbsoluteFill } from "remotion";
import { C, POSES, Pose, Stage, Stick, Txt } from "#engine";

/** Follow the /yt-package brief: three words max, different from the title, one big expression. */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill>
    <Stage bg={C.goldLight}>
      <rect x={0} y={860} width={1920} height={220} fill={C.green} />
      <Txt x={1290} y={330} size={230} font="display">
        THREE
      </Txt>
      <Txt x={1290} y={560} size={230} font="display" color={C.green}>
        WORDS
      </Txt>
      <Stick x={430} y={960} scale={2.6} pose={POSES.cheer as Pose} expr="grin" />
    </Stage>
  </AbsoluteFill>
);
