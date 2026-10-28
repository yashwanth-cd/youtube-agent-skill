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
  // every scene is built from its beats in script.json
  scenes: {},
  script: script as Script,
  voices: VOICE,
  backgrounds: BACKGROUNDS,
  Thumbnail,
  shorts: meta.shorts as ShortDef[],
  shortVoices: SHORT_VOICE,
});
