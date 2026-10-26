import React from "react";
import { AbsoluteFill } from "remotion";
import { C, DISPLAY, Icon, NIGHT, POSES, Pose, SetBg, Stick } from "#engine";

/**
 * /yt-package brief: 3 words that don't repeat the title, one big expression, high contrast at
 * feed size. Title: "5 Ways to Get Rich on a Normal Salary". Thumbnail: NO LUCK NEEDED.
 */
const Word: React.FC<{ x: number; y: number; size: number; color: string; children: string }> = ({ x, y, size, color, children }) => (
  <text x={x} y={y} fontFamily={DISPLAY} fontSize={size} fill={color} stroke={NIGHT} strokeWidth={22} strokeLinejoin="round" paintOrder="stroke" textAnchor="middle">
    {children}
  </text>
);

export const Thumbnail: React.FC = () => (
  <AbsoluteFill>
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <SetBg name="stage" />
      <Icon name="chart-increasing" x={1580} y={760} size={330} rotate={8} />
      <Icon name="money-bag" x={1200} y={790} size={360} rotate={-8} />
      <Icon name="coin" x={1420} y={930} size={150} rotate={20} />
      <Word x={1290} y={300} size={230} color={C.white}>
        NO LUCK
      </Word>
      <Word x={1290} y={530} size={230} color={C.gold}>
        NEEDED
      </Word>
      <Stick x={430} y={1000} scale={2.9} color={C.white} pose={POSES.cheer as Pose} expr="grin" emote="money" seed={2} />
    </svg>
  </AbsoluteFill>
);
