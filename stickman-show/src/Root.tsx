import React from "react";
import { Composition, Folder, Still } from "remotion";
import { SHORT_H, SHORT_W } from "#engine";
import { BRANDING } from "./channel/Branding";
import { VIDEOS } from "./videos";

/**
 * For every video: <id>-full (16:9), <id>-thumbnail, <id>-short-<n> (9:16), and each scene on its
 * own under <id>-scenes for previewing in the Studio.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="channel">
      {BRANDING.map((b) => (
        <Still key={b.id} id={b.id} component={b.component} width={b.width} height={b.height} />
      ))}
    </Folder>
    {VIDEOS.map((v) => (
      <Folder key={v.id} name={v.id}>
        <Composition id={`${v.id}-full`} component={v.Full} width={1920} height={1080} fps={30} durationInFrames={v.fullDuration} />
        <Still id={`${v.id}-thumbnail`} component={v.Thumbnail} width={1920} height={1080} />
        {v.shorts.map((s) => (
          <Composition
            key={s.n}
            id={`${v.id}-short-${s.n}`}
            component={v.shortComponents[s.n]}
            width={SHORT_W}
            height={SHORT_H}
            fps={30}
            durationInFrames={v.shortDuration(s)}
          />
        ))}
        <Folder name={`${v.id}-scenes`}>
          {v.timing.scenes.map((s, i) => (
            <Composition
              key={s.id}
              id={`${v.id}-scene-${s.id}`}
              component={v.scenes[s.id]}
              width={1920}
              height={1080}
              fps={30}
              durationInFrames={s.durationInFrames + (i === v.timing.scenes.length - 1 ? v.endCard : 0)}
            />
          ))}
        </Folder>
      </Folder>
    ))}
  </>
);
