import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { FPS, Line, Timing, absoluteLines, pop } from "./anim";
import { Media } from "./common";
import { MusicBed } from "./LongVideo";
import { C, DISPLAY, HAND } from "./theme";
import { Anchor, ShortDef, VideoInput } from "./types";

export const SHORT_W = 1080;
export const SHORT_H = 1920;
const TAIL = 20;
/** The long video is shown at this scale in a 1080-wide window, cropped at the sides. */
const SCALE = 0.7;
const WIN_Y = 620;
const WIN_H = 1080 * SCALE;

export const hookFrames = (video: VideoInput, s: ShortDef) => video.timing.shorts?.[s.slug]?.durationInFrames ?? 60;

/** An anchor ("way3.me", "way3.me+1.5" or seconds) as a frame on the long video's timeline. */
export const resolveAnchor = (timing: Timing, a: Anchor, edge: "start" | "end"): number => {
  if (typeof a === "number") return Math.round(a * FPS);
  const m = /^(\w+)\.(\w+)([+-][\d.]+)?$/.exec(a);
  if (!m) throw new Error(`bad anchor "${a}" - use "scene.key" or "scene.key+1.5"`);
  let offset = 0;
  for (const s of timing.scenes) {
    if (s.id === m[1]) {
      const line = s.lines.find((l) => l.key === m[2]);
      if (!line) throw new Error(`anchor "${a}": scene ${m[1]} has no line "${m[2]}"`);
      // a few frames of air either side of the line
      const base = edge === "start" ? line.start - 6 : line.end + 8;
      return offset + base + Math.round(Number(m[3] ?? 0) * FPS);
    }
    offset += s.durationInFrames;
  }
  throw new Error(`anchor "${a}": no scene "${m[1]}"`);
};

export const shortSpan = (video: VideoInput, s: ShortDef) => {
  const start = resolveAnchor(video.timing, s.from, "start");
  const end = resolveAnchor(video.timing, s.to, "end");
  const still = s.still === undefined ? start + FPS : resolveAnchor(video.timing, s.still, "start") + 6;
  return { start, end, still };
};

export const shortDuration = (video: VideoInput, s: ShortDef) => {
  const { start, end } = shortSpan(video, s);
  return hookFrames(video, s) + (end - start) + TAIL;
};

/** Which caption chunk of a line is being spoken (lines are split into ~7-word chunks). */
export const captionChunk = (line: Line, frame: number, words = 7) => {
  // break at sentence or clause ends where possible, never leaving a one-word chunk
  const chunks: string[] = [];
  let cur: string[] = [];
  for (const word of line.text.split(" ")) {
    cur.push(word);
    if (cur.length >= words + 1 || (cur.length >= 3 && /[.,?!:;]$/.test(word))) {
      chunks.push(cur.join(" "));
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur.join(" "));
  if (chunks.length > 1 && chunks[chunks.length - 1].split(" ").length < 3) chunks[chunks.length - 2] += " " + chunks.pop();
  const total = chunks.reduce((a, c) => a + c.length, 0);
  const p = (frame - line.start) / Math.max(1, line.end - line.start);
  let acc = 0;
  for (const c of chunks) {
    acc += c.length / total;
    if (p < acc) return c;
  }
  return chunks[chunks.length - 1];
};

/**
 * A vertical Short cut from a long video: a new spoken hook over a frozen first frame, then the
 * span itself. The long video is shown large in the middle with its own captions off; the Short
 * draws bigger captions underneath and the on-screen line above.
 */
export const Short: React.FC<{ video: VideoInput; Full: React.FC; short: ShortDef }> = ({ video, Full, short }) => {
  const f = useCurrentFrame();
  const H = hookFrames(video, short);
  const { start, end, still } = shortSpan(video, short);
  const spanFrames = end - start;
  const cropX = short.cropX ?? 960;
  const left = Math.min(0, Math.max(SHORT_W - 1920 * SCALE, SHORT_W / 2 - cropX * SCALE));

  const all = absoluteLines(video.timing);
  const t = f - H + start;
  const hookLine: Line = { key: "hook", text: short.hook, start: 0, end: H - 6 };
  const line = f < H ? hookLine : all.find((l) => t >= l.start && t < l.end + 6);
  const caption = line ? captionChunk(line, f < H ? f : t) : null;
  const s = pop(f, 3);

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <MusicBed volume={0.09} />
      {video.shortVoices[short.slug] && <Audio src={video.shortVoices[short.slug]} />}

      <div style={{ position: "absolute", top: 110, width: SHORT_W, textAlign: "center", fontFamily: HAND, fontSize: 40, color: C.inkSoft }}>
        THE STICKMAN SHOW
      </div>
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 60,
          width: SHORT_W - 120,
          height: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: 104,
          lineHeight: 1.08,
          color: C.ink,
          scale: String(Math.max(0, s)),
        }}
      >
        {short.onScreen}
      </div>

      <div style={{ position: "absolute", top: WIN_Y, left: 0, width: SHORT_W, height: WIN_H, overflow: "hidden", borderTop: `6px solid ${C.ink}`, borderBottom: `6px solid ${C.ink}` }}>
        <div style={{ position: "absolute", left, top: 0, width: 1920, height: 1080, scale: String(SCALE), transformOrigin: "top left" }}>
          {f < H ? (
            <Media.Provider value={{ voice: false, sfx: false, music: false, captions: false }}>
              {/* <Freeze> mounts every scene of a <Series> at once, so hold the frame by moving the
                  sequence along with the playhead instead */}
              <Sequence from={f - still} layout="none">
                <Full />
              </Sequence>
            </Media.Provider>
          ) : (
            <Media.Provider value={{ voice: true, sfx: true, music: false, captions: false }}>
              <Sequence from={H - start} durationInFrames={start + spanFrames + TAIL} layout="none">
                <Full />
              </Sequence>
            </Media.Provider>
          )}
        </div>
      </div>

      {caption && (
        <div style={{ position: "absolute", top: WIN_Y + WIN_H + 90, left: 70, width: SHORT_W - 140, textAlign: "center" }}>
          <span
            style={{
              fontFamily: HAND,
              fontSize: 70,
              lineHeight: 1.35,
              color: C.white,
              background: C.ink,
              padding: "6px 22px",
              borderRadius: 18,
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            {caption}
          </span>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 120, width: SHORT_W, textAlign: "center", fontFamily: DISPLAY, fontSize: 40, color: C.green }}>
        FULL VIDEO ON THE CHANNEL
      </div>
    </AbsoluteFill>
  );
};
