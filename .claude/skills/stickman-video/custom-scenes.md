# Hand-animated scenes — only when beats can't do it

Full examples: `stickman-show/videos/video-001-5-ways-to-get-rich/src/scenes/*.tsx` (all ten
scenes of the first video are hand-animated). Copy the closest one rather than starting blank.

## Wiring

1. Write `videos/video-NNN-<slug>/src/scenes/<Name>.tsx`.
2. Map it by scene id in `src/index.ts`: `scenes: { way3: Way3 }`. Scenes not in the map stay automatic.
3. If it is the last scene, use `sceneProps("<id>", END_CARD)` and draw the end card yourself:
   `<EndCard f={f - endStart} />` from `#engine`.

```tsx
import React from "react";
import { useCurrentFrame } from "remotion";
import { C, Cue, GROUND, Pop, Scene, Stick, Tag, poseAt, speaking } from "#engine";
import { T, sceneProps } from "../timing";

const L = T.lines("way3");            // L.<key>.start / .end, in frames from the scene start

export const Way3: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(f, [[0, "stand"], [L.me.start, "pointR"]]);
  const sfx: Cue[] = [[L.me.start + 10, "pop", 0.4]];
  return (
    <Scene {...sceneProps("way3")} sfx={sfx}>
      <Pop at={L.me.start + 10} x={1200} y={300}>
        <Tag x={0} y={0} text="ME" font="display" size={48} fill={C.greenLight} />
      </Pop>
      <Stick x={380} y={GROUND} scale={1.35} pose={pose} talking={speaking(f, L)} />
    </Scene>
  );
};
```

## Engine cheat sheet (`#engine`)

Canvas is one 1920×1080 SVG. `GROUND` = 820. Captions occupy y > 960.

- **Timing**: `ease(f, start, dur)` 0→1, `easeInOut`, `pop(f, start)` springy 0→1,
  `mix(f, [f0, f1], [a, b])`, `fadeOut(f, end)`, `window(f, a, b)`, `lerp`, `rand(seed)`, `speaking(f, L)`.
- **Stick**: `<Stick x y scale pose expr talking color accessory("hair"|"cap"|"glasses"|"shades"|"tie") look rotate opacity seed />`.
  Poses: `POSES.<name>`, `poseAt(f, [[frame, "pose", dur?], …])`, `walking(pose, f*0.32)`,
  `walking(pose, f*0.6, 1, true)` (run), `waving(pose, f)`, and `hands(pose)` → hand positions
  (multiply by scale, add x/GROUND) for holding props.
- **Layout pieces**: `Pop at x y`, `Slide at from=[dx,dy] x y`, `Txt x y size font("hand"|"display") color anchor`,
  `Tag x y text size fill font`, `Stamp at x y text`, `Draw at d` (self-drawing path), `Arrow at x1 y1 x2 y2 bend`,
  `CrossOut at x y`, `TitleCard n title sub start end color`, `Thought x y w h from`, `Zzz x y`.
- **Coins**: `FlyCoin at from to`, `CoinStream at from to n every`, `streamCues(at, n, every)` for matching pops.
- **Props**: `Coin Bill CashStack Envelope Jar(fill,label,color,w) Calendar(label,sub) Phone(on,label)
  Bucket(level) CreditCard(rate,color,highlight) Monster(open) Hammer Snowball(r,spin) Basket(count) Book
  Door(label,open) TV(w,text) Car(color,flat,fancy) MoneyTree(grow,drop) Clock(t) Gear(r,teeth,spin,color,label)
  Safe Tumbleweed Bathtub(running,level) Pizza Couch Sign(text) Ticket Rocket Hammock Lemonade
  Certificate(label) Shop Tea BarChart(bars,max,h,gap)`. All take `x y scale rotate opacity`.
- **Sound**: `sfx: Cue[]` with `[frame, "pop"|"whoosh"|"ding"|"thud"|"tick", volume]`.
- **Colours**: `C.paper ink inkSoft green greenLight red redLight gold goldLight blue blueLight white`.

Pattern for a beat inside a scene: `{f >= L.x.start && f < L.y.start + 10 && <g opacity={1 - ease(f, L.y.start - 6, 12)}>…</g>}`.
