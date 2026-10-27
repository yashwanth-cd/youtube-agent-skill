# The Stickman Show — channel setup kit

Everything to fill in when creating the channel, in the order YouTube Studio asks for it. The images
are in `branding/` (re-render any time with `npm run branding`).

---

## 1. Name and handle

- **Channel name:** The Stickman Show
- **Handle:** `@TheStickmanShow`. If it's taken, in order of preference: `@StickmanShow`,
  `@TheStickmanShowTV`, `@StickmanShowHQ`. (I can't check availability from here; YouTube tells
  you as you type.)

## 2. Branding (Studio → Customisation → Branding)

| slot | file | YouTube's spec | notes |
| --- | --- | --- | --- |
| Picture | `branding/profile-picture-800.png` | 98×98 px or larger, square, ≤ 4 MB | Night-blue version; matches the thumbnails. Alternative: `profile-picture-800-alt-gold.png` |
| Banner image | `branding/banner-2560x1440.png` | 2048×1152 or larger, ≤ 6 MB | The name and tagline sit inside the 1546×423 area that shows on every device. The street, Larry and icons fill out the frame on desktop and TV |
| Video watermark | `branding/watermark-150.png` (or `watermark-300.png`) | 150×150 px or larger, ≤ 1 MB | Display time: **Entire video**. It becomes a subscribe button on every video |
| — | `branding/wordmark-transparent.png` | — | For other socials (X, Instagram, TikTok headers), merch, email |

## 3. Description (Customisation → Basic info → Description)

677 of 1,000 characters. The first line is what shows in search and on the channel page, so it
says what the channel is in the words people use.

```
Big ideas about money and life, explained by a stick figure in under 10 minutes.

Stick makes the mistakes so you don't have to. Every video takes one thing nobody taught you in school, like how to stop being broke, pay off debt, start investing, earn more or build better habits, and turns it into a short animated story with clear examples and simple rules you can use the same day.

No hype. No get-rich-quick schemes. No made-up numbers: every example on screen is labelled, with its assumptions shown.

New here? Start with "5 Ways to Get Rich on a Normal Salary".

Subscribe and let Stick do the learning the hard way.

Education and entertainment, not financial advice.
```

If you settle on an upload schedule, add a line like `New videos every Tuesday.` above the
"New here?" line. Only promise a schedule you'll keep.

## 4. Links and contact (Basic info)

- **Links:** add any socials you create (same name and handle everywhere). Leave it empty rather
  than linking placeholders.
- **Contact email:** a dedicated address for business enquiries (e.g. a new Gmail for the
  channel), not your personal one.

## 5. Keywords (Settings → Channel → Basic info → Keywords)

```
stickman, stick figure animation, animated explainer, personal finance, money tips, how to get rich, how to save money, investing for beginners, financial literacy, money habits, budgeting, debt payoff, compound interest, self improvement, life lessons
```

Country of residence: yours. That sets tax and eligibility; it isn't shown publicly.

## 6. Upload defaults (Settings → Upload defaults)

Set once, and every upload starts from it:

- **Title:** leave blank (each video's title comes from its `PUBLISH.md`)
- **Description:**

  ```
  [first two lines from PUBLISH.md]

  Education, not financial advice. Example numbers are labelled as examples, with their assumptions shown on screen.

  [chapters]

  🎨 Animated by The Stickman Show
  🔔 Subscribe for more: https://www.youtube.com/@TheStickmanShow?sub_confirmation=1
  ```
  (fix the handle in the link if you got a different one)
- **Tags:** `stickman, stick figure animation, the stickman show, animated explainer`
  (each video adds its own from `PUBLISH.md`)
- **Visibility:** Private (publish deliberately)
- **Category:** Education
- **Video language / caption certification:** English / None
- **Licence:** Standard YouTube Licence. **Allow embedding:** on. **Publish to subscriptions feed:** on
- **Comments:** On, "Hold potentially inappropriate comments for review"
- **Made for kids:** No (the topics are adult money decisions)
- **Altered or synthetic content:** No. The disclosure is for realistic footage that could be
  mistaken for real people or events, and a cartoon stick figure isn't that.

## 7. Channel layout (Customisation → Layout)

- **Channel trailer for people who haven't subscribed:** for now, *5 Ways to Get Rich on a Normal
  Salary*. Once you have 3–4 videos, ask Claude to make a 45-second trailer from the best moments
  with the same pipeline.
- **Featured video for returning subscribers:** your latest upload.
- **Sections:** Videos → Shorts → playlist "Start Here" → playlist "Money Basics".

## 8. Playlists to create

| playlist | description (paste) |
| --- | --- |
| Start Here | The best place to start: the videos that explain the big ideas first. |
| Money Basics | Saving, debt, budgeting and investing, explained by a stick figure in under 10 minutes each. |
| Stickman Shorts | The fastest money lessons on YouTube. One idea, under a minute. |

## 9. Uploading video 001

From `videos/video-001-5-ways-to-get-rich/`:

1. **Video:** `output/5-ways-to-get-rich.mp4`
2. **Title:** 5 Ways to Get Rich on a Normal Salary
3. **Description and tags:** the block and tag list in `PUBLISH.md`
4. **Thumbnail:** `output/thumbnail.png` (needs a verified channel: Studio → Settings → Channel →
   Feature eligibility → verify with a phone number)
5. **Subtitles:** upload `captions/narration.srt` (Subtitles → Add → Upload file → With timing)
6. **Playlists:** Start Here, Money Basics
7. **End screen:** the last 5 seconds already leave room on the right. Use the template
   "1 video, 1 subscribe" and line the elements up with the two dashed boxes
8. **Cards:** none needed until there's a second video to point to

## 10. Uploading the five Shorts

Each is in `output/shorts/`, 1080×1920 and under 60 seconds. In the Shorts upload, set the
**Related video** to the full video so viewers can jump to it.

| file | title | description |
| --- | --- | --- |
| `short-1-me-vs-larry.mp4` | Same $200 a Month, 10 Years Apart | Same habit, ten years apart, more than double the money. (Example: $200/month, assumed 7% a year.) Full video on the channel. #money #investing #stickman |
| `short-2-hole-in-the-bucket.mp4` | $3,000 of Card Debt = $700 a Year | Why saving while carrying card debt is a leaky bucket. (Example: $3,000 at 22% a year.) Full video on the channel. #debt #money #stickman |
| `short-3-flip-the-order.mp4` | Save 20% First, Not What's Left | Pay yourself first and the 50/30/20 rule in 30 seconds. Full video on the channel. #budgeting #money #stickman |
| `short-4-no-ceiling.mp4` | 10 Minutes a Day = 60 Hours a Year | Cutting costs has a floor. Earning doesn't. Full video on the channel. #selfimprovement #money #stickman |
| `short-5-the-money-machine.mp4` | The 5-Gear Money Machine | Save, kill debt, invest, earn more, own things that earn. Full video on the channel. #money #wealth #stickman |

Titles were linted with `title.py` (all 100/100). Space the Shorts out, say one every day or two,
rather than posting all five at once.

## 11. First community post (once Posts are available on the channel)

> 👋 Welcome to The Stickman Show!
> Stick makes the money mistakes so you don't have to. First episode: 5 ways to get rich on a
> normal salary, from the 50/30/20 rule to the Rule of 72.
> What should Stick learn the hard way next? 👇

Then add a poll: **Budgeting · Investing · Side income · Credit scores**. The answers are free
topic research for the next video (`/yt-plan` can turn them into a schedule).

## 12. Before you monetise: one policy to know

YouTube's Partner Programme does not pay for mass-produced, repetitive or "inauthentic" content.
That rule is aimed at templated channels pumping out near-identical videos. This pipeline makes
consistent videos, so keep each one genuinely its own: a new topic, a new script with real
teaching in it, different sets and beats, and no reused footage. The `stickman-video` skill's
script rules (teach a named framework, an example and a mistake in every section) are what keep
it on the right side of that line.
