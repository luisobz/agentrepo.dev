# Avatar

Animated pixel character for AgentRepo. A single viewport portal follows registered
slots while the character plays independent sprite clips rendered as SVG paths.

## Integration

Wrap the page in `AvatarProvider`, then place `AvatarSlot` elements at destinations.
`useAvatar()` controls position, emotion, messages and badge. `focusAvatar(slot)`
keeps an interaction active until its returned cleanup runs.

The existing provider and slot APIs are preserved. `AvatarFigure` also renders an
individual clip for previews or galleries.

## Art and animation

- `src/sprite/avatar-art.ts`: 32×32 character layers and palette.
- `src/sprite/avatar-clips.ts`: frames, timing, loops and static poses.
- `src/sprite/compose.ts`: SVG paths and RGBA cells from the same pixel source.
- `src/components/avatar-sprite.tsx`: emotion, click reaction and travel clips.
- `src/components/avatar-stage.tsx`: slot tracking, travel and message placement.

Clips cover idle, thinking, happy, surprised, poke, takeoff, fly and land. The stage
reports travel phase and direction; the figure animates its own frames. Configuration
for movement, speed, scale and colors remains in `src/avatar-setup.ts`.

```sh
pnpm --filter @agentrepo/avatar sprites
pnpm nx test avatar
```

The exporter writes PNG sheets, per-clip SVGs and frame metadata to `assets/sprites`.
Runtime rendering uses the pixel source directly, so it does not fetch the sheet.

## Behaviour

The positioning loop sleeps after settling and wakes for slot, layout, scroll and
message changes. It follows animated ancestors and pauses while the tab is hidden.
Sprite timers stop for reduced motion and completed one-shot clips. Enabling reduced
motion during travel moves directly to the destination.

Slots reserve their scaled footprint. Speech bubbles choose a side based on viewport
space and interactive controls; long content scrolls inside the bubble. A persistent
message can be dismissed using the avatar button with pointer, Enter or Space.

## Contextual scenes

`CharacterFigure` shares the clip clock between the native `repo` SVG character
and the `developer`, `guardian`, `researcher` and `publisher` raster characters.
Serve their atlas files under `/avatars/<id>.png`, or supply `assetBase` for a
different static directory. Source concepts, previews and exports are preserved
in `assets/characters`; only the selected 1× atlas is requested at runtime.

`AvatarScene` accepts a tuple of one or two actors, each with a character, label
and message. Native buttons provide keyboard access. Readers select a speaker;
one text intervention is visible while the other character can react. Animation
is paused offscreen, in hidden tabs and for reduced motion.

```tsx
<AvatarScene actors={[
  { character: 'developer', label: 'Development', message: 'Inspect the implementation.' },
  { character: 'guardian', label: 'Security', message: 'Verify its trust boundaries.' },
]} />
```

A scene also works independently of the floating provider. Within an
`AvatarProvider`, a visibility lease suspends the floating mascot and its timed
messages while the scene is visible. Multiple leases are released independently;
leaving the scene or unmounting restores the mascot. Focused interactions such as
menus take precedence and temporarily hide and pause inline actors.
