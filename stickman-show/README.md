# The Stickman Show

Every video on the channel lives here: the script, the animation code, the voice, the finished MP4,
the thumbnail and the Shorts. They are made with the eleven skills in this repo (`/yt-script`,
`/yt-package`, `/yt-seo`, …) and rendered with [Remotion](https://www.remotion.dev).

**All videos:** [VIDEOS.md](VIDEOS.md)

## Why it is all in one folder

This repo is a fork of [Jakeschincariol/youtube-agent-skill](https://github.com/Jakeschincariol/youtube-agent-skill).
Everything the channel adds sits inside `stickman-show/`, and **no file outside this folder is
ever edited**. So pulling the owner's updates is always a clean merge:

```bash
git remote add upstream https://github.com/Jakeschincariol/youtube-agent-skill.git   # once
git fetch upstream
git merge upstream/main          # or press "Sync fork" on GitHub
```

The one thing outside this folder is the channel's own skill, `.claude/skills/stickman-video/`. It
sits at the repo root because that's where Claude Code discovers project skills. Upstream has no
such folder, so it can't conflict either. If you want a channel-specific version of one of the
upstream skills, copy it into `stickman-show/` instead of editing the original. Editing the
original is the one thing that can make a sync conflict.

## Layout

```
stickman-show/
├── VIDEOS.md                  index of every video (npm run index)
├── CLAUDE.md                  how Claude makes a video here - read by Claude Code automatically
├── channel/
│   ├── voice.md               the channel's voice; every skill reads it
│   ├── characters.md          the cast, colours and fonts
│   ├── channel-setup.md       name, handle, description, keywords, upload defaults, layout, playlists
│   └── branding/              profile picture, banner, watermark, wordmark (npm run branding)
├── src/
│   ├── engine/                shared by every video: stick-figure rig, props, captions, Shorts layout
│   ├── videos.ts              the list of videos (new-video appends to it)
│   └── Root.tsx               registers <id>-full, <id>-thumbnail, <id>-short-N for each video
├── public/                    shared fonts, sound effects, music bed
├── tools/                     setup.sh, tts.py (voice), check, make, render, preview, new-video, index, template/
└── videos/
    └── video-001-5-ways-to-get-rich/
        ├── video.json         id, title, status, YouTube link, the Shorts and their timings
        ├── script.json        the script, beat by beat, with what is on screen
        ├── PUBLISH.md         title, thumbnail, description, chapters, tags, Shorts - ready to paste
        ├── src/               this video's scenes, thumbnail and generated timing
        ├── audio/             narration and Shorts hooks (mp3)
        ├── captions/          narration.srt
        ├── reports/           hookscore.py, title.py, deadair.py output
        └── output/            the finished files
            ├── 5-ways-to-get-rich.mp4
            ├── thumbnail.png
            └── shorts/short-1-me-vs-larry.mp4 …
```

Folders are numbered `video-001`, `video-002`, … with three digits so they sort correctly past 9
and 99. Composition ids use the same number: `v001-full`, `v001-short-2`, `v002-thumbnail`.

## Making the next video

Ask Claude: **"make Stickman Show video 2 about compound interest"**. The `stickman-video` skill
runs the whole pipeline. By hand it's:

```bash
bash tools/setup.sh                                   # once per machine / cloud session
npm run new-video -- compound-interest "Working Title"
#   script.json: lines + a "beat" per line (see .claude/skills/stickman-video/beats.md)
npm run icons   -- search money                       # find illustration names
npm run check   -- video-002                          # validate + runtime estimate, no rendering
npm run voice   -- videos/video-002-compound-interest # narration, timing, captions
npm run preview -- video-002                          # one contact-sheet PNG of the whole video
#   add Shorts to video.json, fill in PUBLISH.md
npm run make    -- video-002 --skip-voice             # long video + thumbnail + Shorts + VIDEOS.md
```

### How a video is built

- **Beats, not code.** Each line in `script.json` carries a `beat`: animated line charts,
  counters, donut charts, icon grids, timelines, info cards, VS comparisons, lists, stamps, a
  second character, and so on. It also sets Stick's pose, face, emote and what he's holding.
  `AutoScene` turns that into animation timed to the voice, so a normal video needs no
  hand-written scenes.
- **The look.** Every scene happens on an illustrated set (room, kitchen, office, street, park,
  bank, whiteboard, night stage) with a moving camera, 3,000+ colourful Fluent Emoji
  illustrations, karaoke captions and swipe transitions.
- **The voice.** Kokoro-82M (Apache-2.0, natural-sounding, runs offline on the CPU), voice set
  per video in `video.json`.
- **Everything is keyed to script lines.** Beats, scenes and Shorts point at line keys
  (`"way3.me"`), not seconds. Re-voicing or rewording a line re-times everything for free.
- **Shorts come from the long video.** Each Short is a new spoken hook over a frozen frame, then
  the span, framed vertically with big captions. Define them in `video.json`; `make` renders them.

## Painted backgrounds with WanGP (optional, on a GPU PC)

[WanGP](https://github.com/yashwanth-cd/WanGP) runs open image, video and audio models on a
consumer GPU. The pipeline uses it for the one thing generative models do better than drawn
shapes: rich, painted environments. Characters, lip sync and infographics stay in the engine, so
Stick looks the same in every shot.

1. Give scenes a `bg` prompt in `script.json` (a place: no people, no text).
2. On the GPU machine, with WanGP's Python:
   `python tools/wangp_assets.py videos/video-002-rich-dad-poor-dad --wangp C:/WanGP`
3. Commit `videos/<folder>/assets/` and `src/assets.ts`, then render as usual.

It uses Qwen-Image 20B (Apache-2.0). Check any other model's licence before switching, because
some popular ones are non-commercial. Scenes without a painting keep the drawn set. This uses
WanGP, whose terms ask integrations to say so.

## Storage

Finished videos, thumbnails, Shorts and narration are committed as normal git files. Git LFS
would be nicer, but GitHub refuses LFS uploads to a public fork, and this repo is a fork. Every
file has to stay under GitHub's 100 MB limit: `render.mjs` encodes at CRF 20, which puts a
7-minute video near 50 MB and a Short near 5–10 MB.

Each video adds roughly 80–100 MB to the repo's history, and every clone downloads all of it. That's
fine for dozens of videos. When it starts to hurt, the options are:

1. **Detach the fork** (GitHub → Settings, or ask GitHub Support to detach it) so it becomes a
   normal repo, then switch on the LFS lines in `.gitattributes`. Upstream sync keeps working
   through the `upstream` remote.
2. **Keep only source in git** and put `output/` files in GitHub Releases or cloud storage.
   Everything in `output/` can be re-rendered from the video's folder.

## Licences

Fonts: Patrick Hand and Luckiest Guy (SIL Open Font License). The music bed and sound effects are
synthesised by `tools/sound.py`. The voice is Piper `en_US-norman-medium`, whose training data is
public domain. Several Piper voices are non-commercial, so see `channel/characters.md` before
changing it.
