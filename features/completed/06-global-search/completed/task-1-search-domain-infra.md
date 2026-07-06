# Task 1: Dominio e Infraestructura de Búsqueda (Prisma FTS)

## Descripción
Preparar la base de datos y la capa de infraestructura para ejecutar búsquedas de texto eficientes. Como la arquitectura es hexagonal, debes definir qué se puede buscar (ej. un DTO consolidado `SearchResult`) en `domain`, y luego implementar el repositorio en `infrastructure` que interroga a Prisma.

## Archivos a crear o modificar
- `packages/domain/src/search/search-result.entity.ts` (o interface).
- `packages/application/src/search/search.port.ts` (Interfaz del repo).
- `packages/infrastructure/src/persistence/prisma/repositories/search.repository.ts`.
- `prisma/schema.prisma` (Añadir modelos mock de Skills/Agents temporalmente si no existen, o configuraciones FTS).

## Tests que deben escribirse ANTES de implementar
- Archivo: `packages/infrastructure/src/persistence/prisma/repositories/search.repository.spec.ts`
- Tipo: Integración.
- Qué debe probar: Llamar a `search('query')` devuelve un array del tipo `SearchResult` incluso si la base de datos está vacía, no lanza error y formatea la llamada SQL correctamente.
- Assertions: Array vacío devuelto si mock BD o el query string se pasa al mock del ORM.

## Criterios de finalización
- [ ] Dominio `SearchResult` definido con: `id`, `title`, `description`, `type` (skill, agent, post), `slug`.
- [ ] El esquema de Prisma incluye la flag `previewFeatures = ["fullTextSearchPostgres"]` en el generador si procede según la versión.
- [ ] La clase `SearchRepository` implementa el puerto e invoca llamadas FTS de Prisma (`contains` con mode `insensitive`, o usar raw query a `to_tsvector` si Prisma search no agrupa múltiples tablas bien).

## Notas Técnicas
- Si Prisma falla agrupando múltiples tablas en una consulta FTS (ya que `prisma.model.findMany` solo busca en un modelo), el `SearchRepository` deberá ejecutar consultas en paralelo usando `Promise.all` para Skills, Agents y Blog, o utilizar una raw query (`$queryRaw`) si el rendimiento en paralelo escala mal y se prefiere una View de SQL.
- Para simplificar en Fase 2, `Promise.all` mapeando los resultados al DTO `SearchResult` es totalmente aceptable.
