# Task 3: Configuración de Design Tokens y Variables CSS

## Descripción
Esta tarea consiste en traducir fielmente el documento `design-system.md` a código funcional. Debes crear y registrar todas las variables de color, espaciado, sombras y radios requeridas, asegurándote de que estén disponibles como clases utilitarias de Tailwind CSS v4 para el resto del equipo. 

La paleta incluye temas como: Ivory/Marfil (`--bg-base`, `--bg-surface`), texto (`--text-primary`), Granate (`--brand-garnet`, `--brand-garnet-deep`), Azul (`--brand-blue`), acentos, y colores del modo consola (`--console-bg`, `--console-border`). También se deben definir las sombras suaves específicas y los radios definidos.

## Archivos a crear o modificar
- `packages/ui/src/styles/globals.css` (Modificar para añadir variables CSS personalizadas y configurar el `@theme` de Tailwind v4).
- `apps/web/src/app/layout.tsx` (o equivalente, si se necesita configurar alguna clase en el <html>).

## Tests que deben escribirse ANTES de implementar
- Archivo: No es necesario un test de unidad, pero es imperativo una comprobación cruzada (checklist manual) contra el spec.

## Criterios de finalización
- [ ] La directiva `@theme` en Tailwind v4 o la sección `:root` del CSS incluye la paleta base (Ivory).
  - `--color-bg-base`: `#F6F1E8`
  - `--color-bg-surface`: `#EEE5D7`
  - `--color-bg-warm-white`: `#FFFCF7`
  - `--color-border-soft`: `#D8CDBD`
  - `--color-border-medium`: `#C4B9A8`
- [ ] La directiva `@theme` incluye colores de texto.
  - `--color-text-primary`: `#161616`
  - `--color-text-secondary`: `#4B4B4B`
  - `--color-text-muted`: `#7A7065`
- [ ] La directiva `@theme` incluye el Granate principal.
  - `--color-brand-garnet`: `#7A2230`
  - `--color-brand-garnet-deep`: `#5B1822`
  - `--color-brand-garnet-muted`: `#C4909A`
- [ ] La directiva `@theme` incluye colores de soporte y consola.
  - Azul secundario (`--color-brand-blue`), acentos (oro, verde, rojo).
  - Modo consola (`--color-console-bg`: `#EDE8DF`, etc.).
- [ ] Sombras registradas en el `@theme` (ej. `shadow-sm`, `shadow-md`, `shadow-garnet`).
- [ ] El fondo (`background-color`) del `body` está configurado para usar `bg-base` (`#F6F1E8`) y el color de texto a `text-primary`.

## Notas Técnicas
- En Tailwind v4, las variables CSS añadidas dentro de la directiva `@theme` generarán automáticamente utilidades.
  ```css
  @theme {
    --color-bg-base: #F6F1E8;
    /* Se generará la clase bg-bg-base y text-bg-base */
  }
  ```
- Ten especial cuidado con los nombres exactos que se estipulan en `design-system.md`, o asegúrate de crear alias que se alineen. Por ejemplo, en el documento se menciona `--brand-garnet`. Esto en Tailwind v4 se puede lograr declarando `--color-brand-garnet: #7A2230;` en el bloque `@theme`.
- Define explícitamente en el CSS global algo como:
  ```css
  @layer base {
    body {
      background-color: var(--color-bg-base);
      color: var(--color-text-primary);
    }
  }
  ```
