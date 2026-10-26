# 5 Ways to Get Rich on a Normal Salary — publishing kit

Everything here came out of this repo's skills and tools. Nothing has been uploaded. **You publish.**

- Runtime: **6:35** (6:30 of narration plus a 5-second end card)
- Look: Stickman Show v2. Illustrated sets (room, kitchen, office, whiteboard, park, night stage),
  moving camera, Fluent Emoji illustrations, animated charts, counters and donuts, karaoke captions.
- Voice: Kokoro-82M `am_michael` (Apache-2.0, trained on permissive audio, fine for monetisation).
  Music and sound effects are synthesised by `tools/sound.py`, so there's no licensed audio.
- Files: `output/5-ways-to-get-rich.mp4`, `output/thumbnail.png`, `output/shorts/*.mp4`,
  `captions/narration.srt` (upload it as the caption track).

---

## /yt-script — the hook

Hooks were written against `skills/yt-script/hooks.json` and scored with `hookscore.py`
(`reports/hookscore-report.txt`). The top two:

| score | formula | hook |
| --- | --- | --- |
| **74 STRONG** | The Mistake | Your paycheck lands, and 3 weeks later you're broke again. Stop blaming your salary. It's 5 moves nobody showed you, and almost none of them cost a cent. |
| 72 STRONG | The Warning | Stop waiting to earn more before you start. In 7 minutes, you'll know the 5 moves that build wealth, and why most people never make move 3. |

**Winner: The Mistake.** It names what the viewer is doing right now (blaming their salary),
confirms the title's "normal salary" in the first ten seconds, and opens a numbered list they have
to stay to close. The promise ("a machine that builds wealth on autopilot") goes in the next line,
not the hook. Adding it to the hook dropped the score to 48.

What each section teaches (so the video is worth the click):

| section | the concrete idea |
| --- | --- |
| Pay yourself first | flip the budget order; the **50/30/20 rule**; start at 5% and raise it; separate account; automate |
| Kill high-interest debt | leaky bucket; example: $3,000 at 22% ≈ $700+ a year; **avalanche vs snowball**; **3–6 month emergency fund** |
| Invest early | compound growth; the **Rule of 72**; Me vs Larry chart ($200/month, assumed 7%: about $525K vs $244K); index funds; **employer match**; stay invested |
| Grow your income | costs have a floor and earning doesn't; 10 min/day ≈ 60+ hours/year; ask, switch, build; **lifestyle creep**; save half of every raise |
| Own things that earn | assets vs liabilities; shares, a business, creations; hours vs ownership |
| The machine + a real month | the five moves as one system; no lottery, no hot tips; one payday step by step |

Every figure that isn't a definition is labelled on screen as an example with its assumption.

## /yt-package — title and thumbnail

Ten titles were run through `title.py` (`reports/title-report.txt`), then the top three were linted
as title + thumbnail pairings:

| title | thumbnail | note |
| --- | --- | --- |
| **5 Ways to Get Rich on a Normal Salary** | **NO LUCK NEEDED** | 100, winner: 37 chars, survives the mobile cut, matches the hook |
| Stop Being Broke: 5 Ways to Get Rich | PAYCHECK GONE? | 100, strong alternative for a pain-led angle |
| 5 Ways to Get Rich Slowly, Without Luck | BORING = RICH | 94: thumbnail repeats "rich", dropped |

Thumbnail (`output/thumbnail.png`, composition `v001-thumbnail`): the night stage with a
spotlight, Stick big on the left cheering with $-wings above his head, **NO LUCK** in white and
**NEEDED** in gold with a heavy outline, and a money bag, rising chart and coin bottom right.

## /yt-seo — description (copy everything in the block)

```
How to get rich on a normal salary, explained by a stick figure: 5 money moves that build wealth
without luck, a big raise or a hot tip - the 50/30/20 rule, the debt avalanche, the Rule of 72 and more.

Education, not financial advice. Example numbers are labelled as examples, with their assumptions
shown on screen.

0:00 Why you're broke again
0:24 1. Pay yourself first
1:16 2. Kill high-interest debt
2:23 3. Invest early
3:50 4. Grow your income
4:38 5. Own things that earn
5:16 The whole machine
5:52 What a real month looks like
6:18 Your one job tonight

In this video:
- Pay yourself first: flip your budget and use the 50/30/20 rule
- Credit card interest, the avalanche vs snowball methods, and a 3-6 month emergency fund
- Compound growth, the Rule of 72, and "Me vs Larry": the same $200 a month, ten years apart
  (example assuming 7% a year - not a promise)
- Index funds, employer matches, and why you stay invested through the drops
- Growing your income without lifestyle creep eating the raise
- Assets vs liabilities: owning things that earn while you sleep
- What all five look like in one real month

Your one job tonight: set up one automatic transfer. Any amount.
```

**Tags** (for disambiguation only; they barely matter): how to get rich, get rich on a normal
salary, how to build wealth, personal finance for beginners, pay yourself first, 50/30/20 rule,
debt avalanche, debt snowball, rule of 72, index funds, compound interest, employer match,
lifestyle creep, stick figure animation

**The three queries this should win:**
1. *how to get rich on a normal salary*: the title is nearly this query word for word
2. *how to get rich*: in the title and the first line of the description
3. *how to build wealth*: in the first line of the description

## /yt-chapters

`chapters.py captions/narration.srt --target 9` finds boundaries within about 6 seconds of the
real scene cuts. The list above uses the exact scene starts from `src/timing.json`, retitled as the
promise of each section. It is valid by YouTube's rules: it starts at 0:00, has 9 entries, and
the shortest one is 17 seconds (with the end card).

## /yt-edit

`deadair.py captions/narration.srt` (`reports/deadair-report.txt`): **0 filler cues and 0 retakes.**
It flags 53 "dead" gaps. Those are the deliberate breaths between lines and before scene changes,
where each beat lands, so they stay.

## /yt-shorts — five Shorts already inside the video

Each span opens on a complete thought, has a turn in it, and ends on a line. Each Short gets a new
spoken first line over a frozen frame, then the span, framed vertically with big captions. They are
rendered at `output/shorts/short-N-<slug>.mp4` (1080×1920) and defined in `video.json` with line
anchors, so they re-time themselves if the video is ever re-voiced. New first lines were scored
with `hookscore.py` (`reports/shorts-hookscore.txt`).

| # | span in long video | Short length | new first line (score) | on-screen text |
| --- | --- | --- | --- | --- |
| 1 | 2:46–3:23 | 46s | You and Larry both save $200 a month. He starts 10 years later. Why does he end up with less than half? (58) | SAME $200. 10 YEARS APART. |
| 2 | 1:21–1:46 | 36s | $3,000 on a card at 22% can cost you over $700 in one year. That's why your savings never grow. (64) | THE HOLE IN YOUR BUCKET |
| 3 | 0:29–0:56 | 34s | You save what's left at the end of the month? Stop. That's why there's never anything left. (61) | FLIP THE ORDER |
| 4 | 3:55–4:37 | 50s | You can only cut so many coffees before you hit the floor. Earning has no ceiling, but almost nobody guards it. (59) | CUTTING HAS A FLOOR |
| 5 | 5:16–5:51 | 44s | Stop waiting for a raise to get rich. 5 gears, a normal salary, and almost nobody builds all 5. (49) | THE MONEY MACHINE |

---

**Ship it, or change it?**
