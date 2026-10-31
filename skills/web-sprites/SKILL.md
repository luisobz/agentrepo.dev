---
name: web-sprites
description: Create and integrate animated 2D sprites and pixel characters in websites, including sprite atlases, accessible playback and coordinated characters.
---

# Web sprites

Build a readable character at its actual display size, with animation and an
integration that fits the existing website. A sprite is a 2D graphic, not
necessarily pixel art or a PNG sheet. Choose the representation from the use:
raster atlas for supplied frames, SVG or editable pixel layers for procedural
art, Canvas for many objects, and an existing 3D renderer when the experience
needs cameras, lighting or spatial interaction.

## Inspect before generating

Find the current renderer, editable artwork, animation clock, layout anchors and
interaction state. Preserve the user's existing character and behaviour unless
they ask to replace them. Distinguish source artwork from exported previews.
Establish display size, background, required emotions and whether characters are
decorative or controls. Do not assume a project's frame counts or palette are
requirements for every website.

## Build the artwork and clips

Start with a silhouette and one readable idle pose at target size. Limit detail
to what remains visible there. Keep palette, outlines, proportions and accessory
positions consistent across frames. An image-generation concept can guide the
art, but downscaling it does not establish clean pixel art or animation continuity.

For a regular atlas, record cell dimensions, column count and a row per clip with
`name`, `frames`, `fps`, `loop` and `staticFrame`. For an irregular atlas, use
explicit frame rectangles instead. Leave room for hops and effects. A frame's
source rectangle is `(column * cellWidth, row * cellHeight, cellWidth, cellHeight)`.

Use a small number of changes to communicate breathing, thought or reaction.
Keep unused cells transparent. Inspect each frame and play the clips; valid
metadata alone does not establish visual quality.

## Integrate with the page

Reuse the host clock where possible. Advance loops by their own frame count;
hold the final frame of one-shot clips. Pause timers when hidden or offscreen,
freeze on the designated static frame for reduced motion, and clean up on
unmount. Resume deliberately rather than unintentionally replaying finished clips.

Keep drawing separate from travel, messages and page state. Reserve a stable
footprint. Clip to the selected source rectangle and scale raster art deliberately;
integer physical-pixel scaling is the easiest baseline to inspect. Test actual
CSS size, display density and zoom. `image-rendering: pixelated` alone does not
prove that fractional scaling will preserve every pixel evenly.

For two characters, give each an identity and animation state, coordinate speaking
turns, and budget the combined layout and downloads. Avoid sharing a single global
emotion or message slot between independent actors. When replacing a floating
mascot with an inline scene, restore it on scene exit and unmount. Load only the
characters used on that page, not source concepts or preview GIFs.

A decorative figure stays hidden from assistive technology. An interactive figure
uses a labelled native button, keyboard focus and a text equivalent for its
message. Keep information available without motion.

## Verify and deliver

Test clip switching, one-shot completion, hidden-tab pause, reduced motion,
unmount cleanup and independent characters. Inspect small-screen layout,
background contrast, effects at cell edges, request sizes and existing mascot
behaviour. Test the integration against the project's real build.

Deliver editable art or its source status, runtime assets, clip metadata and
integration instructions. Report what was actually checked. Do not describe
exported images as an integrated component.

The optional [atlas validator](scripts/validate_atlas.py) checks bounded,
non-interlaced 8-bit RGBA PNG sheets and regular JSON grids without dependencies:

```sh
python scripts/validate_atlas.py sheet.png sheet.json
```

Decode externally supplied assets in an isolated environment without network access or secrets.
The helper checks checksums, decompression size, frame bounds and unused-cell transparency;
it does not judge artistic continuity. See the [AgentRepo case study](references/agentrepo.md)
for a working SVG/raster example and the [rendering notes](references/rendering.md)
when selecting a renderer or explaining scaling.
