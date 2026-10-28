import { Script, ShortDef, Timing, defineVideo } from "#engine";
import script from "../script.json";
import meta from "../video.json";
import { Thumbnail } from "./Thumbnail";
import { END_CARD } from "./timing";
import timing from "./timing.json";
import { BACKGROUNDS } from "./assets";
import { SHORT_VOICE, VOICE } from "./voice";

export default defineVideo({
  id: meta.id,
  timing: timing as Timing,
  endCard: END_CARD,
  // Every scene is built from its beats in script.json. To hand-animate one, write
  // src/scenes/<Name>.tsx and map it here by scene id: scenes: { hook: Hook }
  scenes: {},
  script: script as Script,
  voices: VOICE,
  backgrounds: BACKGROUNDS,
  Thumbnail,
  shorts: meta.shorts as ShortDef[],
  shortVoices: SHORT_VOICE,
});
