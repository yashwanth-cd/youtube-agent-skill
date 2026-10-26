# 5 Ways to Get Rich on a Normal Salary — publishing kit

Everything here came out of this repo's skills and tools. Nothing has been uploaded. **You publish.**

- Runtime: **6:49** (6:44 of narration plus a 5-second end card)
- Character: Stick (narrator). Supporting cast: Larry (blue, glasses), the boss (tie), the shady
  guy (shades)
- Voice: Piper TTS `en_US-norman-medium` (public-domain training data, OK for a monetised
  channel), offline. Music and sound effects are synthesised by `tools/sound.py`, so nothing in
  the video is licensed audio.
- Files: `output/5-ways-to-get-rich.mp4`, `output/thumbnail.png`, `output/shorts/*.mp4`,
  `captions/narration.srt` (upload as the caption track).

---

## /yt-script — the hook

Eleven hooks over two rounds, written against `skills/yt-script/hooks.json` and scored with
`hookscore.py`. Round one scored 34–50, all WEAK, so they were rewritten for stakes and
specificity. The final round's panels are in `hookscore-report.txt`. The top two:

| score | formula | hook |
| --- | --- | --- |
| **74 STRONG** | The Mistake | Your paycheck lands, and 3 weeks later you're broke again. Stop blaming your salary. It's 5 moves nobody showed you, and almost none of them cost a cent. |
| 72 STRONG | The Warning | Stop waiting to earn more before you start. In 7 minutes, you'll know the 5 moves that build wealth, and why most people never make move 3. |

**Winner: The Mistake.** It names the exact thing the viewer is doing ("blaming my salary"). It
confirms the title's promise ("on a normal salary") in the first ten seconds, and it opens a list
the viewer has to sit through to close.

The beat-by-beat script, with on-screen notes on every line, is in `script.json`. Narration runs
6:44.

## /yt-package — title and thumbnail

Ten titles were run through `title.py` (`title-report.txt`), then the top three were linted as
title + thumbnail pairings:

| title | thumbnail | note |
| --- | --- | --- |
| **5 Ways to Get Rich on a Normal Salary** | **NO LUCK NEEDED** | 100, winner: 37 chars, survives the mobile cut, matches the hook |
| Stop Being Broke: 5 Ways to Get Rich | PAYCHECK GONE? | 100, strong alternative for a pain-led angle |
| 5 Ways to Get Rich Slowly, Without Luck | BORING = RICH | 94: thumbnail repeats "rich", dropped |

Thumbnail brief: Stick cheering with both arms up, big grin, on the left third. **NO LUCK / NEEDED**
in two stacked lines on the right. A full green savings jar with coins underneath. Warm yellow
background over a green band for contrast at feed size. Rendered at `output/thumbnail.png`
(composition `v001-thumbnail`).

## /yt-seo — description (copy everything in the block)

```
How to get rich on a normal salary, explained by a stick figure: 5 boring money moves that build
wealth without luck, a big raise, or a hot tip.

Education, not financial advice. Example numbers in this video are labelled as examples, with
their assumptions stated on screen.

0:00 Why you're broke again
0:20 The plan
0:36 1. Pay yourself first
1:33 2. Kill high-interest debt
2:31 3. Invest early
3:49 4. Grow your income
4:35 5. Own things that earn
5:18 The whole machine
5:54 What a real month looks like
6:32 Your one job tonight

In this video:
- Why saving "what's left" never works, and how paying yourself first flips it
- How credit card interest drains your savings, and the avalanche and snowball ways out
- Me vs Larry: the same $200 a month, ten years apart (an example assuming 7% a year, not a promise)
- Index funds, employer matches, and why you stay invested through the drops
- Growing your income without lifestyle creep eating the raise
- Owning things that earn while you sleep
- What all five look like in one real month

Your one job tonight: set up one automatic transfer. Any amount.
```

**Tags** (for disambiguation only; they barely matter): how to get rich, get rich on a normal
salary, how to build wealth, personal finance for beginners, pay yourself first, credit card debt,
debt avalanche, debt snowball, index funds, compound interest, employer match, lifestyle creep,
stick figure animation, money habits

**The three queries this should win:**
1. *how to get rich on a normal salary*: the title is nearly this query word for word
2. *how to get rich*: in the title and the first line of the description
3. *how to build wealth*: in the first line of the description ("build wealth")

## /yt-chapters

`chapters.py captions/narration.srt --target 9` found boundaries within about 7 seconds of the
real scene cuts. The list above uses the exact scene starts from `src/timing.json`, retitled as
the promise of each section. It is valid by YouTube's rules: it starts at 0:00, has 10 entries,
and the shortest one is 17 seconds.

## /yt-edit

`deadair.py captions/narration.srt` (`reports/deadair-report.txt`): **0 filler cues and 0 retakes.** It flags 66
"dead" gaps of 0.6–1.8 seconds. Those are the deliberate breaths between lines and the dips
between scenes. Each one is where a prop pops or a card lands, so they stay. Cutting them would
take 28 seconds off and leave the animation no room to land.

## /yt-shorts — five Shorts already inside the video

Each span opens on a complete thought, has a turn in it, and ends on a line. The new first lines
were scored with `hookscore.py` (`reports/shorts-hookscore.txt`). They are rendered at
`output/shorts/short-N-<slug>.mp4` (1080×1920). Each one is the new spoken hook over a frozen
frame, then the span with big captions. They're defined in `video.json` with line anchors, so
they re-time themselves if the video is ever re-voiced.

| # | span in long video | Short length | new first line (score) | on-screen text, first 2s | loop point |
| --- | --- | --- | --- | --- | --- |
| 1 | 2:42–3:27 | 52s | You and Larry both save $200 a month. He starts 10 years later. Why does he end up with less than half? (58) | SAME $200. 10 YEARS APART. | Ends on "It was time." → reopens on "10 years later" |
| 2 | 1:38–1:57 | 28s | $3,000 on a card at 22% can cost you over $700 in one year. That's why your savings never grow. (64) | THE HOLE IN YOUR BUCKET | Ends on "buying absolutely nothing" → the bucket |
| 3 | 0:41–1:03 | 28s | You save what's left at the end of the month? Stop. That's why there's never anything left. (61) | FLIP THE ORDER | Ends on "live on the rest" → "what's left" |
| 4 | 3:54–4:35 | 47s | You can only cut so many coffees before you hit the floor. Earning has no ceiling, but almost nobody guards it. (59) | CUTTING HAS A FLOOR | Ends on "not a lot better" → "the floor" |
| 5 | 5:19–5:53 | 42s | Stop waiting for a raise to get rich. 5 gears, a normal salary, and almost nobody builds all 5. (49) | THE MONEY MACHINE | Ends on "boring stuff" → "5 gears" |

Vertical framing: the Short shows the long video at 70% scale in a 1080-wide window. That keeps
1,543 of the 1,920 source pixels, so Stick on the left third and the props in the centre both
survive. `cropX` in `video.json` shifts the window when a beat sits off-centre.

---

**Ship it, or change it?**
