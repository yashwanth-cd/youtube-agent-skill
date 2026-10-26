# Beats — scenes written in script.json

Source of truth: `stickman-show/src/engine/AutoScene.tsx`. `tools/check.mjs` validates against the
same names. If you add a beat, set, emote or camera mode, update all three.

```json
{ "id": "way1", "chapter": "1. Pay yourself first", "set": "kitchen", "lines": [
  { "key": "title", "text": "Move one. Pay yourself first.",
    "beat": { "type": "title", "n": 1, "title": "PAY YOURSELF FIRST", "sub": "before anything else gets paid", "color": "green", "icon": "money-bag" } },
  { "key": "rule", "text": "A popular starting point is the fifty thirty twenty rule...", "emote": "idea",
    "beat": { "type": "donut", "title": "THE 50 / 30 / 20 RULE", "center": "YOUR PAY",
              "segments": [{ "label": "NEEDS", "value": 50, "icon": "house" }, { "label": "WANTS", "value": 30, "icon": "popcorn" }, { "label": "SAVE", "value": 20, "icon": "money-bag" }] } }
]}
```

## The rules that make it look good

- **Every line gets a beat** unless the previous beat should stay up. A talking head with nothing
  to look at is a podcast.
- **Use icons everywhere.** Any `icon` / `icons` / `holding` value is a Fluent Emoji name (3,000+).
  Find names with `npm run icons -- search <word>`. `check` bundles them automatically.
- **Prefer information beats**: `chart`, `counter`, `donut`, `grid`, `timeline`, `cards`,
  `compare`, `list`. They are what make a video worth watching. Plain `text` is the exception.
- Don't use the same beat type more than twice in a row. Alternate big (cards, chart, donut) and
  punchy (stamp, counter, text).
- Give each scene a different `set` so the video travels: room, kitchen, office, street, board
  (whiteboard, great for charts), park, bank, stage (dark night stage: recaps and big reveals).
- A line keyed `title` gets an extra 1.4s hold and is shown full-screen on the night stage.
- Numbers on screen that aren't facts must be labelled as examples (`note`, `sub`).
- Spoken text: numbers as words. Beat text: digits and $ are fine.

## Line fields (besides `key` and `text`)

| field | values | effect |
| --- | --- | --- |
| `beat` | see below | what appears; stays until the next line with a beat (a `cast` entrance counts) |
| `pose` | stand, relaxed, cheer, pointR, pointL, pointUpR, shrug, sad, think, hold, holdHigh, present, presentL, hips, shock, facepalm, push, sit, wave | overrides the beat's default pose |
| `expr` | smile, grin, flat, frown, o, worried, smug, sleep | Stick's face |
| `emote` | idea, sweat, question, exclaim, money, love, sparkle, angry, zzz, fire, think | reaction icon above the head for that line |
| `holding` | icon name, or `""` to put it down | Stick holds it from this line on |
| `camera` | wide, stick, content, close | framing; defaults per beat. Tight shots only happen when no beat is on screen |
| `burst` | confetti, coins, sparkle | particles at the start of the line |

Scene fields: `id`, `chapter`, `set`, `stickX` (default 330), `lines`.

## Beat types

| type | fields | use for |
| --- | --- | --- |
| `title` | `n?`, `title`, `sub?`, `color?`, `icon?` | section card on the night stage |
| `text` | `text`, `sub?`, `color?`, `icon?` | one punchy statement, icon above |
| `icon` | `icon` or `icons[]` (1–3), `label?`, `sub?` | big floating hero illustration(s) |
| `cards` | `items[{icon, title, text?, color?}]` (2–4) | the explainer staple: options, steps, examples |
| `chart` | `title?`, `x[]`, `series[{label, values[] (null = not started), color?}]`, `prefix?`, `unit?`, `note?` | line/area chart drawn on while spoken, live value chips |
| `counter` | `to`, `from?`, `prefix?`, `suffix?`, `label?`, `note?`, `icon?`, `decimals?`, `color?` | big number ticking up (or down) |
| `donut` | `segments[{label, value, color?, icon?}]`, `center?`, `title?` | splits and budgets (50/30/20) |
| `grid` | `icon`, `count`, `highlight`, `highlightIcon?`, `label?` | "3 in 10", "hundreds of companies" |
| `timeline` | `points[{label, text?, icon?}]`, `title?` | ages, steps over time, a month |
| `compare` | `left{title, icon?, items?, color?}`, `right{…}` | two cards with VS: before/after, A vs B |
| `list` | `title?`, `items[]` (strings or `{text, icon}`) | rules, checklists (≤ 5) |
| `steps` | `items[]` (strings or `{text, icon}`) | numbered/icon circles: the five moves |
| `flow` | `items[]` (strings or `{text, icon}`) | A → B → C with arrows |
| `tags` | `items[]` (strings or `{text, icon}`), `colors?[]` | 2–5 chips popping in |
| `stamp` | `text`, `color?` | rubber-stamp verdict, with screen shake |
| `bars` | `title?`, `bars[{label, value, top?, under?, color?, icon?}]`, `note?` | bar comparison |
| `jars` | `jars[{label, fill 0–1, color?}]`, `coins?` | money split into jars |
| `prop` | `name` (icon or drawn prop), `label?`, `args?` | one big object |
| `props` | `items[{name, label?}]` | 2–3 objects side by side |
| `cross` | `items[]` (icon names or short text) | things that get crossed out |
| `quote` | `text` | speech bubble from Stick |
| `cast` | `who` (larry, boss, shady, friend), `label?`, `expr?`, `pose?`, `emote?`, `stay?` | a second character on the right. Leaves when the next beat arrives; `"stay": true` keeps them on through later beats until `clear` (keep those beats narrow, they share the stage) |
| `clear` | – | empty the stage (lets the camera go tight on Stick) |

Drawn props (animated, older style): jar, bucket (leaks), car, moneyTree, safe, basket, hammock,
phone (`args.on`), card (`args.rate`), monster (chomps), bathtub, lemonade, snowball.

Colours: green, red, blue, gold, purple, ink, or any hex.

## Picking beats fast

- A number that matters → `counter`. Growth over time → `chart`. A split → `donut`.
- Options or examples → `cards`. Two sides → `compare`. A process → `flow` or `timeline`.
- Rules → `list`. Traps → `cross`. A verdict → `stamp`. Scale ("most people") → `grid`.
- A second person in the story → `cast`, then other beats while they stay on stage.
