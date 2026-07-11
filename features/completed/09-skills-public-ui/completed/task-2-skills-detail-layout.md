# Task 2: Layout de Detalle de Skill

## Descripción
Diseñar y maquetar la página dinámica `/skills/[slug]`. Debe leer del backend los datos completos de la Skill y mostrar el encabezado (Título, Meta, Fechas) seguido del contenedor principal que alojará el visor.

## Archivos a crear o modificar
- `apps/web/src/app/skills/[slug]/page.tsx`

## Criterios de finalización
- [ ] Página implementada usando Segmento Dinámico en Next.js.
- [ ] Recupera los datos vía tRPC usando el slug de la URL. Si no existe, muestra página 404 de forma limpia.
- [ ] El layout tiene un header con el título grande, el tipo (chip) y un slot preparado para los botones de acción en la esquina superior derecha del bloque de contenido.
- [ ] Configura generación de metadata dinámica (`generateMetadata`) para el título de la página (SEO).
