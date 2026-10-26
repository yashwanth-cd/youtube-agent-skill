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

- **Sets**: every scene happens somewhere: a warm living room, kitchen, office, city street,
  park, bank, a whiteboard room for charts, and a dark night stage for title cards and recaps.
  Decoration stays at the edges, behind a light haze, so the content in the centre reads.
- **Camera**: always moving a little (slow push-in), reframing per line, with parallax between
  the set and the action. Stamps shake the screen.
- **Stick**: black ink with a white sticker outline, big expressive face (brows, blush,
  highlights in the eyes), emotes above his head, and things in his hand. White on the night stage.
- **Illustrations**: Fluent Emoji (flat), colourful and consistent, for every object and idea.
- **Information graphics**: line charts, counters, donuts, icon grids, timelines, cards, VS
  comparisons. Something to learn on screen in every beat.
- Colours: night blue `#1D2142` (stage, transitions, caption outline), green `#2E9E5B` (good, money
  in), red `#E0503A` (bad, money out), blue `#3B6FD8` (neutral, Larry), gold `#F2B33D` (highlights).
- Fonts: **Luckiest Guy** for titles, **Baloo 2 ExtraBold** for captions, cards and numbers,
  **Patrick Hand** for the odd handwritten label.
- Captions: big Baloo 2, white with a night-blue outline, with the word being spoken in gold.
- Transitions: a night-blue panel with a green edge swipes across between scenes.
- End card: THANKS FOR WATCHING, two end-screen slots on the right, red SUBSCRIBE.

## Sound

- Voice: **Kokoro-82M**, voice `am_michael`, speed 1.0. Apache-2.0 weights, trained only on
  permissive or non-copyrighted audio, and already used in commercial products. **Never switch to
  a model or voice with a non-commercial licence** (for example Piper's `ryan` is CC BY-NC-SA).
  Check the model card first. The Piper `norman` voice (public-domain data) stays as a fallback.
- Music: a soft synthesised lo-fi loop under the voice at 11% (`public/music/lofi-loop.wav`).
- Sound effects: pop, whoosh, ding, thud, tick (`public/sfx/`, synthesised by `tools/sound.py`).

## Thumbnails

Stick big on the left (cheering, shocked or pointing), 2–3 huge words on the right in Luckiest Guy
(one line ink, one line green), one prop that carries the idea, on a yellow background with a
green band. The words never repeat the title.
