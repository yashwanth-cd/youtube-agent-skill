# The Stickman Show — characters and look

The engine draws all of this (`src/engine/`). This file is the bible: keep new videos consistent with it.

## Cast

| name | how he's drawn | role | in scripts |
| --- | --- | --- | --- |
| **Stick** | black ink, white head, little hair curl | narrator and host. Makes the mistake first, then fixes it | always on screen, left third |
| **Larry** | blue, round glasses | the friend who does it the other way: the cautionary comparison | `{"type":"cast","who":"larry"}` |
| **The boss** | black, red tie | employer, matches, raises | `"who":"boss"` |
| **The shady guy** | grey, sunglasses and hat | get-rich-quick seller; "if it promises fast and guaranteed, run" | `"who":"shady"` |
| **The friend** | green, cap | a neutral second voice, someone to explain things to | `"who":"friend"` |

Stick speaks; the others don't (one narrator voice keeps the channel recognisable).

## Look

- Warm paper background `#F7F1E3`, ink `#1F1D1A`, a soft vignette, hand-drawn line "boil" every 4 frames.
- Accents: green `#2E9E5B` (good, money in), red `#E0503A` (bad, money out), blue `#3B6FD8`
  (neutral, Larry), gold `#F2B33D` (coins, highlights).
- Fonts: **Luckiest Guy** for titles and labels, **Patrick Hand** for captions and handwriting.
- Burned-in captions in a dark rounded bar at the bottom of every long video and Short.
- Scenes dip briefly to paper between each other. Section cards: big numbered circle + title.
- End card: THANKS FOR WATCHING, two dashed end-screen slots on the right, red SUBSCRIBE.

## Sound

- Voice: Piper `en_US-norman-medium` at `lengthScale` 0.95. Its training data is public domain, so it's
  fine for a monetised channel. **Don't switch to a voice whose model card says NC or "fine-tuned
  from lessac"** (ryan is CC BY-NC-SA, joe is fine-tuned from lessac). Check the `MODEL_CARD` on
  Hugging Face first.
- Music: a soft synthesised lo-fi loop under the voice at 11% (`public/music/lofi-loop.wav`).
- Sound effects: pop, whoosh, ding, thud, tick (`public/sfx/`, synthesised by `tools/sound.py`).

## Thumbnails

Stick big on the left (cheering, shocked or pointing), 2–3 huge words on the right in Luckiest Guy
(one line ink, one line green), one prop that carries the idea, on a yellow background with a
green band. The words never repeat the title.
