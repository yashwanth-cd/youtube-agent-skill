---
name: stickman-video
description: >-
  Make a complete Stickman Show video - script, voice, animation, long video, thumbnail, Shorts and
  publishing kit - with the pipeline in stickman-show/. Use for "make the next video", "video
  about X", "new episode", "stickman video", re-rendering or fixing an existing Stickman Show
  video, or adding Shorts to one.
---

# stickman-video

The Stickman Show pipeline is already built. **Do not re-explore it.** Everything you need is in
this file, `beats.md` and `custom-scenes.md`. Read engine source only when a beat or helper
listed there cannot do the job.

Work from `stickman-show/`. Never edit files outside `stickman-show/` and `.claude/skills/stickman-video/`.
The rest of the repo is the upstream skills pack and must stay mergeable.

## 0. Session setup (cloud sessions start empty)

```bash
cd stickman-show && bash tools/setup.sh     # npm ci, Piper + voice model, voice.md into ~/.claude/youtube
```
If Remotion cannot download Chrome: `export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`
(or any local chrome-headless-shell).

## 1. Start the video

```bash
npm run new-video -- <kebab-slug> "<working title>"     # -> videos/video-NNN-<slug>/, registered
```

## 2. Script (the repo's /yt-script rules, condensed)

- Voice: `channel/voice.md`. Cast and look: `channel/characters.md`. Never invent a number. Any
  figure on screen is labelled as an example, with its assumption stated out loud.
- Hook: write 5 against `../skills/yt-script/hooks.json`, run
  `python3 ../skills/yt-script/hookscore.py hooks.txt`, rewrite until the top one is ≥ 70 STRONG,
  keep the top 2. Save the hooks to `reports/hooks.txt` and the panels to `reports/hookscore-report.txt`.
- Shape: hook (0–15s) → the turn (say what the video does, no intro) → one idea per beat → the
  payoff, said explicitly → **one** ask. Channel default: 5 numbered moves, 6–8 minutes.
- Write it straight into `script.json` as scenes → lines. **Give every line a `beat`** from
  `beats.md` unless the previous beat should stay up, and lean on the information beats (chart,
  counter, donut, cards, grid, timeline, compare). Give each scene its own `set`. Add `emote`,
  `holding` and `burst` where they help the joke or the point. Spoken text: numbers as words
  ("two hundred dollars"). Beats: digits and $ are fine.
- Teach something concrete in every section: a named framework, rule of thumb, worked example or
  common mistake. A list of vague tips is what the viewer can get anywhere.
- Icons: `npm run icons -- search <word>` (e.g. `search money`, `search house`). 3,000+ Fluent Emoji.
- Length: `npm run check -- video-NNN` prints the word count and the runtime estimate (calibrated
  to the channel voice). Aim for 1,000–1,250 words for 6–8 minutes. Fix every ERROR it prints.

## 3. Package (the repo's /yt-package rules, condensed)

Write 10 titles → `python3 ../skills/yt-package/title.py reports/titles.txt`. Lint the top 3 with
their thumbnail text: `title.py --title "..." --thumb "..."`. The thumbnail has 3 words max and
none repeat the title. Set `title` and `thumbnailText` in `video.json`. Edit `src/Thumbnail.tsx`:
change the two words and the pose (it already follows the channel layout).

**Checkpoint:** show the user the top 2 hooks with scores, the title and thumbnail pairing, and
the runtime estimate. Ask "ship it, or change it?". Skip this only if they said to run without stopping.

## 4. Voice, look, fix

```bash
npm run voice -- videos/video-NNN-<slug>      # Kokoro narration mp3s, src/timing.json, captions/narration.srt
npm run preview -- video-NNN                  # ONE contact sheet: a frame per line -> out/preview-vNNN-full.png
```
Read the single preview image. Fix overlaps by changing beats in `script.json`. Changing spoken
text means re-voicing, and everything re-times itself because beats are keyed to lines. Re-preview.
Only hand-animate a scene (`custom-scenes.md`) when no beat combination can show the idea.

## 5. Chapters, edit check, SEO, Shorts

- Chapters: `python3 ../skills/yt-chapters/chapters.py captions/narration.srt --target <scenes>`
  confirms the boundaries. Use scene starts from `src/timing.json` and each scene's `chapter` as
  the titles. Rules: starts at 0:00, at least 3 entries, each ≥ 10s.
- Edit check: `python3 ../skills/yt-edit/deadair.py captions/narration.srt > reports/deadair-report.txt`.
  It expects 0 FILLER and 0 REPEAT. The 0.6s/1.8s "DEAD" gaps are the deliberate beats; leave them.
- SEO: the first two description lines carry the 3 search queries the video should win. Then the
  chapters, then what is covered. 10–15 disambiguation tags.
- Shorts (/yt-shorts): pick 3–5 spans of 20–55s that open on a complete thought, have a turn, and
  end on a line. For each, write a new first line (score it with hookscore.py) and 2–4 words of
  on-screen text, and add it to `video.json` → `shorts` with **line anchors**
  (`"from": "way3.me", "to": "way3.time", "still": "way3.larry+1"`). Then
  `npm run voice -- videos/video-NNN-<slug> --shorts-only` and `npm run preview -- video-NNN --short 1`.
- Fill in `PUBLISH.md` (the template headings are already there).

## 6. Render and file it

```bash
npm run make -- video-NNN --skip-voice     # check -> typecheck -> long video + thumbnail + Shorts -> VIDEOS.md
```
The long video renders at about 3–4 frames per second on 4 CPUs (a 7-minute video takes about an
hour). Run it in the background. Then set `status: "rendered"` and `runtime` in `video.json`,
`npm run index`, and commit **only `stickman-show/`** on the session's branch and push. Media is
plain git (GitHub blocks LFS on forks), so check every output file is under 100 MB.

## Token budget rules

- Don't read engine files to learn the API: `beats.md` / `custom-scenes.md` are the API.
- Check visuals with `npm run preview` (one image), never frame by frame.
- Don't re-voice to tweak visuals. Beats and scenes re-time from `timing.json` for free.
- A finished video needs: `script.json`, `video.json`, `PUBLISH.md`, `src/Thumbnail.tsx`, and
  zero hand-written scenes in the normal case.
- Voice: Kokoro `am_michael` (set in `video.json` → `voice`). The other bundled voices are
  am_fenrir, am_puck, am_adam, bm_george, bm_fable, af_heart, af_bella. Don't switch to a voice or
  model with a non-commercial licence.
