# Character artwork

Four raster characters complement the original TypeScript/SVG mascot:

| ID | Role |
| --- | --- |
| `developer` | Development |
| `guardian` | Security |
| `researcher` | Research |
| `publisher` | Communication |

Each directory contains a 256×288 RGBA atlas, its 4× nearest-neighbour export,
clip metadata, individual animation previews and the original visual concept.
The atlases follow the package's eight-clip contract. Runtime pages load only
the 1× atlas of characters they display; concepts and GIF previews are source
resources for inspection, rather than page dependencies.

Use `AvatarScene` for one or two contextual characters and `CharacterFigure` for
an individual clip. The original `AvatarFigure` remains the default travelling
mascot renderer.
