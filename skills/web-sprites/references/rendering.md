# Rendering and scaling

A sprite is an independently drawn 2D object. A sprite atlas groups frames; pixel
art is an artistic style. These concepts overlap but are not interchangeable.

Use a regular sheet when frames share a cell size. CSS background positioning,
an SVG viewport with an image, and Canvas `drawImage` can select the same source
rectangle. The choice depends on the host application's interaction and drawing
requirements. Avoid adding a new rendering engine solely to display a small
mascot when the existing stack can do it well.

For pixel art, test nearest-neighbour integer scaling first. Browser
`image-rendering: pixelated` may first scale to an integer multiple and then
smooth to the final requested size. A 1.5× CSS size is not a universal guarantee
of identical-looking pixels across display densities and zoom levels.

A 4× export repeats source pixels. It does not add detail, and downloading it is
not automatically necessary for a high-density display. Compare the actual
appearance and transfer cost at the intended size.

Three.js also has a Sprite class, a textured plane facing the camera. Sprites can
therefore coexist with 3D scenes. Choose by the experience and measured behaviour,
not by assuming that a sprite is always smaller, faster or more appropriate.

Primary references:

- [Canvas drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)
- [CSS image-rendering](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/image-rendering)
- [Reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [Three.js Sprite](https://threejs.org/docs/pages/Sprite.html)
