# AgentRepo case study

The implementation is public at
[packages/avatar](https://github.com/luisobz/agentrepo.dev/tree/main/packages/avatar).

The original mascot stores palette keys and patches on a 32×32 grid in
`avatar-art.ts`. `avatar-clips.ts` defines poses, timing, loops and static frames.
`compose.ts` combines layers and merges horizontal pixel runs into SVG paths;
`AvatarFigure` draws them. Its exported PNG sheet is a distribution artifact,
rather than the source used by the travelling mascot.

Four raster characters use the same eight-clip contract: idle, thinking, happy,
surprised, poke, takeoff, fly and land. Each 256×288 atlas contains eight columns
of 32×36 cells, with four pixels of headroom and 31 active frames. Those are this
project's choices, not a universal sprite format.

`CharacterFigure` selects native SVG or a raster atlas. Both reuse the existing
clip clock. `AvatarScene` takes one or two actor descriptions with identity,
label and message. A reader chooses whose message to open; only one intervention
is displayed at a time. The other character can react independently.

While an inline scene is visible, a suspension lease hides the floating mascot
and pauses its messages. Leaving the scene or unmounting releases that lease;
multiple leases cannot accidentally restore a mascot still hidden by another
scene. Scene animations stop offscreen, in hidden tabs and for reduced motion.
The original provider, slot navigation and mascot artwork remain available.

```tsx
import { AvatarScene } from '@agentrepo/avatar';

<AvatarScene
  label="Explore the example"
  actors={[
    { character: 'developer', label: 'Development', message: 'Inspect the frame contract.' },
    { character: 'guardian', label: 'Security', message: 'Check the input and decoding limits.' },
  ]}
/>
```

The web serves only the atlas required by a selected character. High-resolution
concepts, 4× exports and GIF previews stay among the repository's source assets.
To reproduce the package checks in that repository:

```sh
pnpm nx test avatar
pnpm --filter @agentrepo/avatar sprites
```
