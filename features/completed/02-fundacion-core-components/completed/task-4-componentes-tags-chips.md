# Task 4: Componentes Tags y Chips (Categorización Técnica)

## Descripción
Crear los componentes de etiquetado (Badge/Tag y Chips de tipo) para organizar los contenidos. Un "Tag" normal es pill-shaped y usado para temas genéricos (`#ai`, `#mcp`). Un "Chip" es más técnico, tiene forma ligeramente rectangular (`radius-sm`) y tipografía monoespaciada en mayúsculas, usado para determinar explícitamente el tipo de recurso (ej. `[prompt]`, `[system]`).

## Specs Visuales del Design System
**Tag de contenido normal (Badge general):**
- font: Geist 400, 12px.
- padding: 4px 10px.
- border-radius: `--radius-full` (9999px).
- background: `--bg-surface`.
- color: `--text-secondary`.
- border: 1px solid `--border-soft`.
- hover: border-color `--brand-garnet-muted`, color `--brand-garnet`.

**Chip de tipo (Tipo de recurso técnico):**
- font: Geist Mono 500, 11px, uppercase, tracking (letter-spacing: 0.08em).
- padding: 3px 8px.
- border-radius: `--radius-sm` (4px).
- border: 1px solid.
- Variantes por tipo (colores exactos según DS):
  - `prompt`: bg `#F4E8EA` (garnet-ghost), color `#7A2230` (garnet), border `#C4909A` (garnet-muted).
  - `system`: bg `#E8EEF5`, color `#2F5D8A` (blue), border `#8AAAC8`.
  - `persona`: bg `#F0EBE0`, color `#7A6840`, border `#C4AD82`.
  - `template`: bg `#E8EDF0`, color `#3D5E6B`, border `#8AAAB8`.
  - `config`: bg `#EBF0E8`, color `#4A6B4A`, border `#8AB88A`.

## Archivos a crear o modificar
- `packages/ui/src/components/ds/tag.tsx` (Componente de Tag normal).
- `packages/ui/src/components/ds/type-chip.tsx` (Componente de Chip técnico).
- `packages/ui/src/index.ts` (Exportaciones).

## Tests que deben escribirse ANTES de implementar
- Archivo: `packages/ui/src/components/ds/type-chip.spec.tsx` y `tag.spec.tsx`.
- Tipo: Componente.
- Qué debe probar:
  - El componente `TypeChip` renderiza la variante adecuada (ej. `prompt`) y aplica las clases correspondientes.
  - El `Tag` renderiza el texto (children) con las clases pill-shaped correctas.
- Assertions: Comprobación de que la variante en `TypeChip` cambie las utilidades CSS según lo dictado.

## Criterios de finalización
- [ ] Componente `Tag` implementado usando `cva` y estilos de badges redondeados.
- [ ] Componente `TypeChip` creado, definiendo las 5 variantes exclusivas (`prompt`, `system`, `persona`, `template`, `config`).
- [ ] La tipografía del `TypeChip` es `font-mono uppercase tracking-[0.08em] text-[11px] font-medium`.
- [ ] Ambos componentes pueden usarse en el frontend exportados desde `@agentrepo/ui`.

## Notas Técnicas
- Se recomienda hacer que el `TypeChip` acepte directamente el string del tipo (ej. `<TypeChip type="prompt" />`) y use internamente `cva` mapeando este string a los colores.
- Puedes utilizar valores CSS hardcodeados en Tailwind si estos colores no están globalmente en el theme, o mejor usar las variables del theme creadas en Feature 01 (ej. `--brand-garnet-ghost` si se declaró así).
