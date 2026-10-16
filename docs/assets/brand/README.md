# Assets de AgentRepo

| Carpeta          | Contenido                                             |
| ---------------- | ----------------------------------------------------- |
| `symbols/`       | Símbolo en SVG: primary, light, dark y outline        |
| `wordmarks/`     | Logotipo y composiciones horizontal y apilada en SVG  |
| `icons/`         | Iconos PNG de 16, 32, 64, 128, 180, 192, 256 y 512 px |
| `banners/`       | Banner de README y preview social suministrados       |
| `illustrations/` | Ilustraciones estáticas de la mascota                 |

Los SVG se reconstruyeron a partir de las referencias. El logotipo utiliza Geist Bold convertido a trazados: no requiere fuentes externas. La licencia de Geist se conserva en [FONT-LICENSE.txt](FONT-LICENSE.txt). Sus colores proceden de los tokens actuales del proyecto; este paquete no cambia la paleta de la web.

Los banners conservan las imágenes suministradas en JPG: README 1280×427 y social 1280×672. Son assets estáticos, sin referencias a servicios externos.

Las ilustraciones de marca son independientes del avatar animado de `packages/avatar`. No sustituyen sus sprites, animaciones ni integraciones.

La licencia del proyecto es AGPL-3.0 y el gestor de paquetes es pnpm. Los badges del README reflejan esos datos, en lugar de las etiquetas MIT/npm de la referencia visual.

La lámina `illustrations/mascot-static-sheet.png` contiene cinco poses estáticas: saludo, reposo, alegría, trabajo y ayuda. Se reconstruyó con `imagegen` desde la referencia de mayor calidad, con fondo transparente y sin etiquetas. No es una secuencia de animación.

## Referencias y variantes

`references/` conserva las nueve imágenes originales suministradas, incluida la lámina general, las poses, los banners, las insignias, los símbolos, los logotipos y las vistas de favicon. `drafts/` conserva las dos extracciones generadas anteriores a la lámina seleccionada.

[RESOURCE-MANIFEST.json](RESOURCE-MANIFEST.json) registra tamaño y SHA-256 de cada recurso archivado. Estas referencias se conservan completas; sus etiquetas de ejemplo no sustituyen los datos del proyecto.
