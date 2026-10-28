# Rich Dad Poor Dad Summary: 6 Lessons in 7 Minutes — publishing kit

Nothing here is uploaded. **You publish.**

- Runtime: **7:13** (7:08 of narration plus a 5-second end card)
- New in this episode: the two dads (and the boss) speak their own lines in their own voices,
  audio-driven lip sync, Stick acts (panic, fall, jump), and the paycheck is handed over and spent
  on screen.
- Files: `output/rich-dad-poor-dad.mp4`, `output/thumbnail.png`, `output/shorts/*.mp4`,
  `captions/narration.srt` (upload it as the caption track).

## Why this idea

The pipeline's `/yt-viral` outlier ranking couldn't run: youtube.com, vidIQ and Social Blade are
blocked in the build environment, and search results don't carry per-video view counts. The
evidence used instead: many separate channels keep publishing animated *Rich Dad Poor Dad*
summaries, and the book reportedly sold over 32 million copies. Creators repeat what keeps working,
so the topic has proven, evergreen search demand. The angle that makes this version different is
**what it gets right, and what it gets wrong**. Allow youtube.com in the environment's network
settings to rank outliers properly next time.

## /yt-script — the hook

| score | formula | hook |
| --- | --- | --- |
| 76 STRONG | Contrarian Flip | You might lose money following Rich Dad Poor Dad. 32 million copies sold, but almost nobody tells you which lessons actually work. |
| **74 STRONG** | The Question | Your house is not an asset? That's from a book with 32 million copies sold. But which of its 6 lessons actually work, and which could leave you broke? |

**Used: The Question (74).** The 76 relies on "almost nobody tells you", a claim we can't back up.
The house line is accurate, visual, and is the book's most argued-about idea.

Sources and claims are listed in `script.json` → `sources`. Opinions are attributed: critics,
including rival author John T. Reed, doubt "rich dad" existed. Rich Global LLC's 2012 Chapter 7
filing is documented.

## /yt-package — title and thumbnail

Ten titles were linted with `title.py` (`reports/title-report.txt`):

| title | thumbnail | note |
| --- | --- | --- |
| **Rich Dad Poor Dad Summary: 6 Lessons in 7 Minutes** | **NOT AN ASSET?** | 98, winner: the exact search phrase survives the mobile cut |
| 32 Million Copies Later: Is Rich Dad Poor Dad Right? | HALF WRONG? | 100, but loses the subject on mobile and misses "summary" |
| Rich Dad Poor Dad Summary: Keep 6 Ideas, Skip 3 | NOT AN ASSET? | 98 |

Thumbnail (`output/thumbnail.png`): the night stage, Stick shocked with a question mark, a house
and a big red question mark, **NOT AN** in white and **ASSET?** in gold.

## /yt-seo — description (copy everything in the block)

```
Rich Dad Poor Dad summary in 7 minutes, explained by a stick figure: Robert Kiyosaki's 6 lessons, the cash-flow picture that explains the whole book, and the parts you should ignore.

Education, not financial advice. Example numbers are labelled as examples on screen.

0:00 Is your house an asset?
0:21 The two dads
1:11 1. The rich don't work for money
1:54 2. Assets vs liabilities
2:56 3. Mind your own business
3:33 4. Taxes and corporations
4:17 5. The rich invent money
4:57 6. Work to learn, not to earn
5:31 What the book gets wrong
6:34 The book on one page

In this video:
- Poor dad vs rich dad: "I can't afford it" vs "How can I afford it?"
- The rat race, and why a raise alone doesn't fix it
- Assets vs liabilities, and the cash-flow patterns of the poor, the middle class and the rich
- Why a new car fails the asset test, and the "what would still pay me?" question
- Building your asset column while keeping your job
- How taxes differ for employees and business owners (rules vary by country: ask an accountant)
- Financial intelligence, and why the deal stories skip the risk
- What the book gets wrong: the fable question, leverage, your house, index funds, degrees

Your one job tonight: draw two columns and list your assets and liabilities.

🔔 Subscribe for more: https://www.youtube.com/@TheStickmanShow?sub_confirmation=1
```

**Tags:** rich dad poor dad summary, rich dad poor dad, robert kiyosaki, rich dad poor dad
animated, book summary, assets vs liabilities, financial literacy, cash flow, is your house an
asset, rat race, personal finance for beginners, stick figure animation, the stickman show

**The three queries this should win:**
1. *rich dad poor dad summary*: the title starts with it
2. *rich dad poor dad explained / animated*: in the first line of the description and the tags
3. *is your house an asset*: the hook, the thumbnail and a chapter

## /yt-chapters

`chapters.py captions/narration.srt --target 10` finds boundaries within about 6 seconds of the
real scene cuts. The list above uses the exact scene starts. It is valid: it starts at 0:00, has
10 entries, and the shortest is 22 seconds.

## /yt-edit

`deadair.py` (`reports/deadair-report.txt`): **0 filler, 0 retakes.** The flagged gaps are the
deliberate breaths where beats land.

## /yt-shorts — four Shorts

Each Short gets a new spoken first line (scored, `reports/shorts-hookscore.txt`) over a frozen
frame, then the span. Titles were linted with `title.py` (`reports/short-titles-report.txt`).
Set **Related video** to the full video on each.

| # | file | span | length | title | first line (score) |
| --- | --- | --- | --- | --- | --- |
| 1 | `short-1-i-cant-afford-it.mp4` | 0:48–1:10 | 32s | 5 Words That Change How You See Money | You probably grew up hearing "I can't afford it." Rich dad said 5 different words… (55) |
| 2 | `short-2-why-a-raise-isnt-enough.mp4` | 2:27–2:49 | 29s | Got a Raise, Still Broke? 1 Picture Explains | You got a raise and you're still broke? This one picture explains why, in 20 seconds. (60) |
| 3 | `short-3-is-your-house-an-asset.mp4` | 6:01–6:12 | 19s | Is Your House an Asset? 32M Copies Say No | Is your house an asset? A book with 32 million copies sold says no… (73) |
| 4 | `short-4-your-car-isnt-an-asset.mp4` | 2:09–2:26 | 26s | Your Car Fails This 1-Line Money Test | Stop calling your car an asset. You lose money on it every month… (55) |

Short descriptions (paste, then add the full video's link once it's live):

1. `"I can't afford it" shuts your brain off. "How can I afford it?" switches it on. From Rich Dad Poor Dad. #richdadpoordad #money #mindset #stickman`
2. `The cash-flow picture of the poor, the middle class and the rich. From Rich Dad Poor Dad. #richdadpoordad #personalfinance #money #stickman`
3. `By Kiyosaki's definition your house isn't an asset. The full picture is more complicated. #richdadpoordad #realestate #money #stickman`
4. `Fuel, insurance, repairs, and it loses value. The 1-line test from Rich Dad Poor Dad. #richdadpoordad #cars #money #stickman`

---

**Ship it, or change it?**
