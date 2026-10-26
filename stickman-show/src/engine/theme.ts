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

loadFont({ family: HAND, url: staticFile("fonts/PatrickHand.woff2") });
loadFont({ family: DISPLAY, url: staticFile("fonts/LuckiestGuy.woff2") });

export const W = 1920;
export const H = 1080;
export const GROUND = 820;
