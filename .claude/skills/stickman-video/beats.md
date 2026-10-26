# Beats — scenes written in script.json

Source of truth: `stickman-show/src/engine/AutoScene.tsx`. `tools/check.mjs` validates against the
same names. If you add a beat, prop or pose, update all three.

```json
{ "id": "way1", "chapter": "1. Pay yourself first", "stickX": 380, "lines": [
  { "key": "title", "text": "Move one. Pay yourself first.",
    "beat": { "type": "title", "n": 1, "title": "PAY YOURSELF FIRST", "sub": "before anything else", "color": "green" } },
  { "key": "most", "text": "Most people save whatever is left.", "expr": "worried", "pose": "shrug",
    "beat": { "type": "jars", "jars": [{ "label": "RENT", "fill": 0.8 }, { "label": "SAVINGS", "fill": 0 }] } }
]}
```

- A line's `beat` appears when the line starts and stays up until the next line that has a beat.
  `{ "type": "clear" }` empties the screen.
- Items inside a beat (tags, list rows, bars, jars…) pop in spread across that line's speech, so
  put them in the order they are said.
- A line keyed `title` gets an extra 1.4s hold after it (title cards land).
- Stick stands on the left (`stickX`, default 380) and talks on every line. Content is centred
  at x≈1200. The bottom band is reserved for captions.
- Pose defaults come from the beat type. Override with `"pose"` and `"expr"`.
- The last scene automatically ends with the channel end card (thanks, 2 end-screen slots,
  subscribe) while Stick waves.

## Beat types

| type | fields | use for |
| --- | --- | --- |
| `title` | `n?`, `title`, `sub?`, `color?` | section card ("Move 3") - full screen |
| `text` | `text`, `sub?`, `color?` | one big statement |
| `tags` | `items[]`, `colors?[]` | 2–5 labels popping in (bills, reasons, names) |
| `list` | `title?`, `items[]` | checklist ticks, ≤ 6 rows |
| `steps` | `items[]` | numbered circles: the five moves, a process |
| `stamp` | `text`, `color?` | rubber-stamp verdict ("IT'S NOT YOUR SALARY") |
| `bars` | `title?`, `bars[{label, value, top?, under?, color?}]` | comparisons with numbers (label as example!) |
| `jars` | `jars[{label, fill 0–1, color?}]`, `coins?` | budgets, splitting money; `coins` flies coins in from Stick |
| `compare` | `left{title, items?, color?, prop?}`, `right{…}` | two columns: takes vs makes, before vs after |
| `flow` | `items[]` | A → B → C chain with arrows |
| `prop` | `name`, `label?`, `args?` | one big object; `args` go to the prop (e.g. phone `{"on":1}`) |
| `props` | `items[{name, label?}]` | 2–3 objects side by side |
| `cross` | `items[]` (prop names or text) | things that get crossed out ("no lottery, no hot tip") |
| `quote` | `text` | speech bubble from Stick |
| `cast` | `who`, `label?`, `expr?`, `pose?` | a second character walks on at the right and stays until `clear` or the scene ends |
| `clear` | – | empty the screen |

Colours: `green`, `red`, `blue`, `gold`, `ink`, or any hex.

## Names

**Props** (`prop`, `props`, `cross`, `compare.prop`): jar, bucket, car, fancyCar, moneyTree, safe, tv,
shop, lemonade, couch, bathtub, basket (index fund), hammock, sign, cash, coin, bill, envelope
(paycheck), calendar, phone (`args.on`, `args.label`), card (credit card, `args.rate`), clock, gear, book,
certificate (`args.label`), ticket (lotto), rocket, snowball, monster (interest), hammer, pizza, tea,
tumbleweed

**Poses**: stand, relaxed, cheer, pointR, pointL, pointUpR, shrug, sad, think, hold, holdHigh,
present, presentL, hips, shock, facepalm, push, sit, wave

**Faces** (`expr`): smile, grin, flat, frown, o (surprised), worried, smug, sleep

**Cast** (`who`): larry (blue, glasses - the cautionary friend), boss (tie), shady (shades -
get-rich-quick seller), friend (green, cap)

## Picking beats fast

- Numbers or a comparison → `bars`. Splitting money → `jars`. A sequence → `steps` or `flow`.
- A list of mistakes or traps → `cross`. Rules or habits → `list`. A verdict → `stamp`.
- One concrete object carries the idea → `prop`. Two opposing ideas → `compare`.
- A story with a second person → `cast` first, then other beats while they stay on stage.
- Don't use the same beat type on more than two lines in a row. Variety holds retention.
