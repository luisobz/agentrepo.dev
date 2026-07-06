# Task 1: SEO Metadata & Open Graph

## Descripción
Configurar el SEO vital del sitio web para garantizar indexación correcta, previsualizaciones premium en redes sociales (LinkedIn, Twitter/X) y consistencia de marca en motores de búsqueda.

## Archivos a crear o modificar
- `apps/web/src/app/layout.tsx` (Metadatos globales).
- `apps/web/src/app/**/page.tsx` (Metadatos por página).
- `apps/web/public/` (Favicon, Apple Touch Icons).

## Criterios de finalización
- [ ] **Configuración Next.js Metadata API:**
  - Definir y exportar `export const metadata: Metadata` en el root `layout.tsx` estableciendo títulos por defecto y plantillas dinámicas (ej. `title: { default: "AgentRepo.dev", template: "%s | AgentRepo.dev" }`).
  - Metadatos de Open Graph (`openGraph`) e imágenes de preview.
  - Metadatos de Twitter Card (`twitter: { card: "summary_large_image" }`).
- [ ] **Metadatos por Página:**
  - Cada página pública crítica (`/skills`, `/agents`, `/blog`) debe exportar metadatos descriptivos contextuales ricos en SEO.
- [ ] **Favicons Premium:**
  - Colocar favicons correctos de marca (en formato `.ico` o `.svg` dinámico) en el directorio `public/` y configurar los links correctos en el layout principal.
