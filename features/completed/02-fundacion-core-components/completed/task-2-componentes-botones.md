# Task 2: Componente Botones (Primary, Secondary, Ghost)

## Descripción
Debes construir el componente `Button` usando la base de `shadcn/ui` y modificarlo sustancialmente para que respete al 100% el Design System de AgentRepo.dev. El diseño demanda 3 variantes específicas: Primario (Granate), Secundario (Outline) y Ghost (Link). Las animaciones de interacción (hover, active) y las sombras deben ser precisas.

## Specs Visuales del Design System
**Botón Primario:**
- background: `--brand-garnet` (`#7A2230` mapéalo a la clase Tailwind correcta, ej: `bg-[var(--color-brand-garnet)]` o el nombre configurado en la feature 01).
- color: `--bg-warm-white` (`#FFFCF7`).
- border-radius: `--radius-md` (8px).
- padding: 10px 20px.
- font: Geist 500, 14px.
- shadow: `--shadow-garnet` (`0 4px 16px rgba(122,34,48,0.15)`).
- hover: background `--brand-garnet-deep` (`#5B1822`), shadow: `0 6px 20px rgba(122,34,48,0.22)`.
- active: background `--brand-garnet`, `transform: translateY(1px)`.

**Botón Secundario:**
- background: transparent.
- color: `--text-primary`.
- border: 1px solid `--border-medium`.
- border-radius: `--radius-md`.
- padding: 10px 20px.
- font: Geist 500, 14px.
- hover: background `--bg-surface`, border-color `--brand-garnet-muted`.

**Botón Ghost / Link:**
- background: transparent.
- color: `--text-secondary`.
- border: none.
- padding: 8px 12px.
- font: Geist 400, 14px.
- hover: background `--bg-surface`, color `--text-primary`.

## Archivos a crear o modificar
- `packages/ui/src/components/base/button.tsx` (Componente React)
- `packages/ui/src/index.ts` (Exportar el botón)

## Tests que deben escribirse ANTES de implementar
- Archivo: `packages/ui/src/components/base/button.spec.tsx` (Requiere un setup de test UI como testing-library/react o simplemente pruebas DOM si hay un entorno configurado, si no, crear un test de renderizado básico).
- Tipo: Test Unitario / Componente.
- Qué debe probar: El botón se renderiza correctamente con las variantes dadas por `cva`.
- Casos de prueba:
  - Renderizado del botón por defecto (primario) con sus clases específicas de color granate.
  - Renderizado del botón con variante `secondary`.
  - Evento `onClick` se dispara correctamente.
- Assertions: Comprobar la presencia de las clases clave y el llamado del mock de la función.

## Criterios de finalización
- [ ] El componente `Button` existe y usa `cva` para gestionar las variantes de diseño.
- [ ] Las clases de Tailwind aplicadas replican exactamente el estilo definido en el Design System para `default`, `secondary`, y `ghost`.
- [ ] Los tests del componente pasan correctamente.
- [ ] El botón se puede importar desde `@agentrepo/ui` en las aplicaciones.

## Notas Técnicas
- Puedes partir de instalar el botón de shadcn: `pnpm dlx shadcn@latest add button`. Luego, edita manualmente el archivo generado en `packages/ui/src/components/base/button.tsx`.
- Utiliza las utilidades CSS exactas generadas en la Feature 01 o usa corchetes si es estrictamente necesario, aunque es preferible usar las clases generadas automáticamente por Tailwind v4 `@theme`.
