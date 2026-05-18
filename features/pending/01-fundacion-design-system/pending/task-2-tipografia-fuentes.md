# Task 2: Integración de tipografías Geist y Geist Mono

## Descripción
El Design System estipula el uso de dos tipografías principales: `Geist` (como fuente sans principal) y `Geist Mono` (como fuente monoespaciada para código y elementos de consola). Estas fuentes deben integrarse de forma óptima en el proyecto para evitar parpadeos (FOUT/FOIT) y asegurar un buen rendimiento. Dado que usamos Next.js, se utilizará el paquete `next/font/local` o `next/font/google` (si están disponibles nativamente allí, aunque Geist y Geist Mono usualmente se instalan vía paquetes NPM específicos como `geist` o `@vercel/font`).

## Archivos a crear o modificar
- `packages/ui/src/styles/fonts.ts` (Crear para centralizar la declaración de la fuente, opcional pero recomendado)
- `apps/web/src/app/layout.tsx` (Para inyectar las variables CSS de las fuentes en el DOM)
- `apps/admin/src/app/layout.tsx` (Para inyectar las variables CSS de las fuentes en el DOM)
- `packages/ui/src/styles/globals.css` (Para asignar estas variables de fuente en el `@theme` de Tailwind v4 y definir la fuente base del `body`).
- `package.json` (Añadir la dependencia de fuentes si es necesario).

## Tests que deben escribirse ANTES de implementar
- Archivo: No aplica un test de unidad clásico.
- Tipo: E2E (Visual / DOM).
- Qué debe probar: El body del documento inyecta las variables `--font-geist-sans` y `--font-geist-mono` en el HTML/Body.
- Asersión esperada: El elemento `<body>` tiene la clase generada por `next/font` y el CSS computado del texto del cuerpo refleja la familia 'Geist'.

## Criterios de finalización
- [ ] Las fuentes `Geist` y `Geist Mono` están disponibles en el proyecto.
- [ ] Están configuradas en los `layout.tsx` usando `next/font` para proveer sus respectivas variables CSS.
- [ ] En `globals.css` (o el equivalente de configuración `@theme` de Tailwind v4), `font-sans` se sobrescribe para usar `var(--font-geist-sans)` (o su alias) y `font-mono` para usar `var(--font-geist-mono)`.
- [ ] El `body` de las aplicaciones tiene aplicada la fuente sans-serif por defecto, que debe resolver a Geist.

## Notas Técnicas
- Puedes instalar el paquete oficial de Vercel: `pnpm add geist`.
- En Next.js, las fuentes se cargan en el layout principal:
  ```tsx
  import { GeistSans } from 'geist/font/sans';
  import { GeistMono } from 'geist/font/mono';
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <body>{children}</body>
      </html>
    );
  }
  ```
- No olvides actualizar el `@theme` de Tailwind v4 en tu archivo CSS para que mapee las familias de fuentes (ej. `font-family-sans: var(--font-geist-sans);`).
