import React from "react";
import { AbsoluteFill } from "remotion";
import { BOLD, C, DISPLAY, Icon, NIGHT, POSES, Pose, SetBg, Stick, waving } from "#engine";

/**
 * Channel branding, drawn with the same Stick, fonts and colours as the videos.
 * Rendered by `npm run branding` into channel/branding/.
 */

const Outlined: React.FC<{ x: number; y: number; size: number; color: string; stroke?: number; font?: string; children: string; anchor?: "middle" | "start" }> = ({
  x,
  y,
  size,
  color,
  stroke = size * 0.12,
  font = DISPLAY,
  children,
  anchor = "middle",
}) => (
  <text x={x} y={y} fontFamily={font} fontWeight={font === BOLD ? 800 : undefined} fontSize={size} fill={color} stroke={NIGHT} strokeWidth={stroke} strokeLinejoin="round" paintOrder="stroke" textAnchor={anchor}>
    {children}
  </text>
);

const wave = waving(POSES.stand as Pose, 6);

/** Profile picture, 800x800. YouTube shows it as a circle, down to ~40px: one big face, high contrast. */
export const Avatar: React.FC<{ variant?: "night" | "gold" }> = ({ variant = "night" }) => {
  const night = variant === "night";
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 800 800" width={800} height={800}>
        <defs>
          <radialGradient id="av-bg" cx="50%" cy="38%" r="70%">
            <stop offset="0" stopColor={night ? "#3A4285" : "#FFE08A"} />
            <stop offset="1" stopColor={night ? NIGHT : "#F2A93D"} />
          </radialGradient>
          <clipPath id="av-circle">
            <circle cx={400} cy={400} r={400} />
          </clipPath>
        </defs>
        <g clipPath="url(#av-circle)">
          <rect width={800} height={800} fill="url(#av-bg)" />
          {night && <path d="M 330 0 L 470 0 L 760 800 L 40 800 Z" fill="#FFF4C9" opacity={0.12} />}
          <Stick x={400} y={1810} scale={5.4} pose={POSES.stand as Pose} expr="grin" color={night ? C.white : C.ink} seed={2} />
          <Icon name="sparkles" x={655} y={215} size={130} shadow={false} rotate={12} />
        </g>
        <circle cx={400} cy={400} r={388} fill="none" stroke={night ? C.gold : C.white} strokeWidth={24} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Banner, 2560x1440. Everything that must be read sits in the 1546x423 centre that shows on every
 * device (x 507-2053, y 508-931); the street, cast and icons around it show on desktop and TV.
 */
export const Banner: React.FC = () => (
  <AbsoluteFill>
    <svg viewBox="0 0 2560 1440" width={2560} height={1440}>
      <g transform="scale(1.3334)">
        <SetBg name="street" />
      </g>
      <rect width={2560} height={1440} fill={NIGHT} opacity={0.18} />
      {/* outside the safe area: decoration only */}
      {[
        ["money-bag", 230, 380, 210, -10],
        ["chart-increasing", 2330, 360, 220, 8],
        ["light-bulb", 330, 1080, 170, 12],
        ["books", 2240, 1090, 190, -8],
        ["coin", 150, 760, 120, 20],
        ["rocket", 560, 250, 150, -20],
      ].map(([n, x, y, s, r]) => (
        <Icon key={n as string} name={n as string} x={x as number} y={y as number} size={s as number} rotate={r as number} />
      ))}
      <Stick x={2230} y={1290} scale={1.9} pose={POSES.present as Pose} color={C.blue} accessory="glasses" seed={5} expr="smile" />
      {/* the safe area */}
      <rect x={530} y={520} width={1500} height={400} rx={60} fill={NIGHT} opacity={0.92} />
      <rect x={530} y={520} width={1500} height={400} rx={60} fill="none" stroke={C.gold} strokeWidth={10} />
      <Stick x={665} y={895} scale={1.15} pose={wave} expr="grin" color={C.white} seed={2} />
      <Outlined x={1400} y={710} size={124} color={C.white} stroke={0}>
        THE STICKMAN SHOW
      </Outlined>
      <text x={1400} y={800} fontFamily={BOLD} fontWeight={800} fontSize={46} fill={C.gold} textAnchor="middle">
        Big ideas about money and life, explained by a stick figure
      </text>
    </svg>
  </AbsoluteFill>
);

/** Video watermark (YouTube's subscribe button over videos): square, transparent, shown at ~60px. */
export const Watermark: React.FC = () => (
  <AbsoluteFill>
    <svg viewBox="0 0 300 300" width={300} height={300}>
      <defs>
        <clipPath id="wm-circle">
          <circle cx={150} cy={150} r={138} />
        </clipPath>
      </defs>
      <circle cx={150} cy={150} r={146} fill={C.gold} />
      <g clipPath="url(#wm-circle)">
        <rect width={300} height={300} fill={NIGHT} />
        <Stick x={150} y={690} scale={2.05} pose={POSES.stand as Pose} expr="grin" color={C.white} seed={2} />
      </g>
    </svg>
  </AbsoluteFill>
);

/** Wordmark on a transparent background, for other socials and the end of videos. */
export const Wordmark: React.FC = () => (
  <AbsoluteFill>
    <svg viewBox="0 0 2000 500" width={2000} height={500}>
      <Stick x={190} y={470} scale={1.45} pose={wave} expr="grin" seed={2} />
      <Outlined x={1150} y={300} size={170} color={C.white} stroke={26}>
        THE STICKMAN SHOW
      </Outlined>
      <text x={1150} y={410} fontFamily={BOLD} fontWeight={800} fontSize={58} fill={C.gold} stroke={NIGHT} strokeWidth={12} paintOrder="stroke" strokeLinejoin="round" textAnchor="middle">
        explained by a stick figure
      </text>
    </svg>
  </AbsoluteFill>
);

const Night: React.FC = () => <Avatar variant="night" />;
const Gold: React.FC = () => <Avatar variant="gold" />;

/** id, component, size, transparent background? */
export const BRANDING = [
  { id: "channel-avatar", file: "profile-picture-800.png", component: Night, width: 800, height: 800, transparent: false },
  { id: "channel-avatar-gold", file: "profile-picture-800-alt-gold.png", component: Gold, width: 800, height: 800, transparent: false },
  { id: "channel-banner", file: "banner-2560x1440.png", component: Banner, width: 2560, height: 1440, transparent: false },
  { id: "channel-watermark", file: "watermark-300.png", component: Watermark, width: 300, height: 300, transparent: true },
  { id: "channel-wordmark", file: "wordmark-transparent.png", component: Wordmark, width: 2000, height: 500, transparent: true },
] as const;
