import { ShortDef, Timing, defineVideo } from "#engine";
import meta from "../video.json";
import { Close } from "./scenes/Close";
import { Hook } from "./scenes/Hook";
import { Machine } from "./scenes/Machine";
import { Month } from "./scenes/Month";
import { Plan } from "./scenes/Plan";
import { Way1 } from "./scenes/Way1";
import { Way2 } from "./scenes/Way2";
import { Way3 } from "./scenes/Way3";
import { Way4 } from "./scenes/Way4";
import { Way5 } from "./scenes/Way5";
import { Thumbnail } from "./Thumbnail";
import { END_CARD } from "./timing";
import timing from "./timing.json";
import { SHORT_VOICE } from "./voice";

export default defineVideo({
  id: meta.id,
  timing: timing as Timing,
  endCard: END_CARD,
  scenes: { hook: Hook, plan: Plan, way1: Way1, way2: Way2, way3: Way3, way4: Way4, way5: Way5, machine: Machine, month: Month, close: Close },
  Thumbnail,
  shorts: meta.shorts as ShortDef[],
  shortVoices: SHORT_VOICE,
});
