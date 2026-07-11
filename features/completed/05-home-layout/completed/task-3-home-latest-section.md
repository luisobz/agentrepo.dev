# Task 3: Sección 'Latest' (Novedades)

## Descripción
En la parte inferior del viewport del Hero o justo después de hacer scroll, debe aparecer una sección limpia que liste el contenido más reciente añadido al repo. Esta sección sirve para dar vida al repositorio y fomentar el descubrimiento si el usuario no quiere buscar activamente.

## Archivos a crear o modificar
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/home/latest-section.tsx` (Opcional).

## Tests que deben escribirse ANTES de implementar
- Archivo: N/A (Se puede validar visualmente o probar si se abstrae en un componente independiente).

## Criterios de finalización
- [ ] Debajo del Hero existe una sección títulada "Latest" o "Recently Added".
- [ ] Renderiza un Grid (CSS Grid, ej. `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) con al menos 3 a 6 "Cards" o "List Items".
- [ ] Utiliza los componentes base (Feature 02) como Cards, Badges y TypeChips.
- [ ] Los datos de estas tarjetas son mockeados por ahora (ej. "Sistema de RAG con DeepSeek", "Prompt de Extracción de Datos").

## Notas Técnicas
- El diseño no especifica si esto es un grid de tarjetas grandes o una lista densa. Opta por una lista limpia o tarjetas horizontales (Cards compactas) para no saturar la vista.
- Incluye el componente `TypeChip` (creado en la feat 02) en cada item mockeado para demostrar la mezcla de tipos de contenido (skills, agents, blog).
