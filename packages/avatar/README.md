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
