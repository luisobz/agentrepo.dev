# Task 2: Router tRPC y Casos de Uso de Búsqueda

## Descripción
Conectar el repositorio de búsqueda (`packages/infrastructure`) con la capa de aplicación (Casos de Uso) y exponerlo hacia el frontend mediante un router de tRPC. Este router deberá validar el input (la query de búsqueda) usando `zod` y limitar los resultados para no saturar la red.

## Archivos a crear o modificar
- `packages/application/src/search/global-search.use-case.ts`
- `packages/trpc/src/lib/routers/search.ts` (Sub-router).
- `packages/trpc/src/lib/routers/_app.ts` (Exportar el router `search`).

## Tests que deben escribirse ANTES de implementar
- Archivo: `packages/application/src/search/global-search.use-case.spec.ts`
- Tipo: Unitario.
- Qué debe probar: El caso de uso llama al repositorio y recorta resultados si superan el límite (ej. top 10), o delega el paginado. Lanza error o devuelve vacío si la query tiene menos de 2 caracteres.
- Assertions: Array vacío, array recortado, error validación.

## Criterios de finalización
- [ ] Caso de uso implementado que inyecta la interfaz `SearchPort`.
- [ ] Endpoint de tRPC definido: `trpc.search.global.query({ q: string })`.
- [ ] `zod` valida que la query sea de tipo string.
- [ ] Si la query está vacía, devuelve un array vacío de inmediato sin tocar el repositorio (optimización).

## Notas Técnicas
- Configura el token de inyección correctamente en NestJS para que la dependencia de infraestructura se resuelva dentro del módulo de tRPC o en un módulo de `Application` importado.
- En tRPC, la validación de entrada con zod arrojará un BAD_REQUEST automáticamente al cliente si no cumple las reglas (`z.string().min(2)`).
