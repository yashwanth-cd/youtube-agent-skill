import React from "react";
import { AbsoluteFill } from "remotion";
import { C, DISPLAY, Icon, NIGHT, POSES, Pose, SetBg, Stick } from "#engine";

/**
 * /yt-package brief: 3 words that don't repeat the title, one big expression, high contrast at
 * feed size. Title: "Rich Dad Poor Dad Summary: 6 Lessons in 7 Minutes". Thumbnail: NOT AN ASSET?
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
      <Icon name="house-with-garden" x={1330} y={800} size={420} rotate={-4} />
      <Icon name="red-question-mark" x={1640} y={640} size={240} rotate={14} />
      <Word x={1290} y={290} size={210} color={C.white}>
        NOT AN
      </Word>
      <Word x={1290} y={500} size={210} color={C.gold}>
        ASSET?
      </Word>
      <Stick x={430} y={1000} scale={2.9} color={C.white} pose={POSES.shock as Pose} expr="o" emote="question" seed={2} />
    </svg>
  </AbsoluteFill>
);
