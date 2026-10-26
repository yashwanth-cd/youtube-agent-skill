# The Stickman Show — instructions for Claude

This folder is a YouTube channel's production system. To make or change a video, use the
**`stickman-video` skill** (`.claude/skills/stickman-video/` at the repo root). It has the whole
pipeline, the beat catalogue and the engine cheat sheet, so there is no need to explore the code.

Rules that always apply:

- Only change files inside `stickman-show/` (and the skill folder). Everything else is the
  upstream skills repo and must stay mergeable with `git merge upstream/main`.
- One folder per video: `videos/video-NNN-<slug>/`. Make it with `npm run new-video`, never by hand.
- Prefer beats in `script.json` over hand-written scenes. Check visuals with `npm run preview`
  (one image).
- Never invent numbers. Figures on screen are labelled as examples with their assumptions.
- The voice must stay commercially licensed (see `channel/characters.md`, Sound).
- Finished files go only in `videos/*/output/` and must stay under 100 MB each (plain git: GitHub
  blocks LFS on forks). Never commit scratch renders (`out/` is ignored).
