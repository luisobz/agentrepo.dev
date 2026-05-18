# Task 3: Componentes Inputs de Texto y Cards

## Descripción
En esta tarea se deben implementar los componentes de entrada de texto (Inputs base) y los contenedores estructurales (Cards). Se basarán en los componentes de shadcn pero adaptados a los bordes, colores y tipografías específicas del sistema, incluyendo una variante especial técnica (Consola) para los Cards.

## Specs Visuales del Design System
**Input estándar:**
- background: `--bg-warm-white` (`#FFFCF7`).
- border: 1px solid `--border-soft`.
- border-radius: `--radius-md` (8px).
- padding: 10px 14px.
- font: Geist 400, 15px, color: `--text-primary`.
- placeholder: `--text-placeholder`.
- focus: border-color `--brand-garnet`, outline none, shadow `0 0 0 3px rgba(122,34,48,0.08)` (ring).

**Card base (Skills/Blog):**
- background: `--bg-warm-white`.
- border: 1px solid `--border-soft`.
- border-radius: `--radius-lg` (12px).
- padding: 20px 24px (puede delegarse a los subcomponentes CardHeader/CardContent).
- shadow: `--shadow-xs`.
- hover (opcional como clase variante interactiva): border-color `--border-medium`, shadow `--shadow-sm`, transform `translateY(-2px)`.

**Card técnica (Agents/Consola):**
- background: `--console-bg` (`#EDE8DF`).
- border: 1px solid `--console-border`.
- border-radius: `--radius-lg`.
- font-family: Geist Mono (`font-mono`).
- focus (si interactiva): border-color `--brand-garnet-muted`.

## Archivos a crear o modificar
- `packages/ui/src/components/base/input.tsx`
- `packages/ui/src/components/base/card.tsx`
- `packages/ui/src/index.ts` (Exportaciones)

## Tests que deben escribirse ANTES de implementar
- Archivo: `packages/ui/src/components/base/input.spec.tsx` y `card.spec.tsx`.
- Tipo: Componente.
- Qué debe probar:
  - El Input reacciona al evento `onChange`.
  - El Card renderiza el children correctamente.
  - El Card tiene una variante técnica que aplica la fuente monoespaciada y el background de consola.
- Assertions: Comprobación de que el elemento existe, de clases esperadas (`font-mono` para la consola, el placeholder renderizado).

## Criterios de finalización
- [ ] Componente `Input` implementado con los estados de focus correctos (borde granate, sombra ring).
- [ ] Componente `Card` implementado, incluyendo `CardHeader`, `CardTitle`, `CardContent`, etc., ajustando el padding default al diseño.
- [ ] El componente `Card` tiene un prop o variante (ej. `variant="console"`) para aplicar el estilo técnico monoespaciado y color de fondo `--console-bg`.
- [ ] Los tests de los componentes pasan.

## Notas Técnicas
- Para el Input, el focus ring en Tailwind suele implementarse usando las clases `focus:ring-X`, puedes definir el color del ring o usar una sombra (`box-shadow`) manual mediante utilidades arbitrarias (ej. `focus:shadow-[0_0_0_3px_rgba(122,34,48,0.08)]`) si no quieres extender la configuración de anillos.
- Añade a la Card una utilidad o variante mediante `cva` si planeas que la tarjeta tenga comportamiento iteractivo de hover, o deja que el consumidor agregue esas clases.
