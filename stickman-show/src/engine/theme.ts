import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  paper: "#F7F1E3",
  paperDark: "#EADFC8",
  ink: "#1F1D1A",
  inkSoft: "#5A554C",
  green: "#2E9E5B",
  greenLight: "#BFE7C9",
  red: "#E0503A",
  redLight: "#F7C9BF",
  gold: "#F2B33D",
  goldLight: "#FBE3A6",
  blue: "#3B6FD8",
  blueLight: "#C7D7F7",
  white: "#FFFDF8",
};

export const HAND = "PatrickHand";
export const DISPLAY = "LuckiestGuy";
/** Clean, bold, rounded: captions, card text, numbers. */
export const BOLD = "Baloo2";
export const NIGHT = "#1D2142";

loadFont({ family: HAND, url: staticFile("fonts/PatrickHand.woff2") });
loadFont({ family: DISPLAY, url: staticFile("fonts/LuckiestGuy.woff2") });
loadFont({ family: BOLD, url: staticFile("fonts/Baloo2-ExtraBold.woff2"), weight: "800" });
loadFont({ family: BOLD, url: staticFile("fonts/Baloo2-SemiBold.woff2"), weight: "600" });

export const W = 1920;
export const H = 1080;
export const GROUND = 820;
