# Feature 10: Backend de Agentes (Agents)

## Meta
- **Número:** 10
- **Fase:** Fase 3 — Agents y Blog
- **Objetivo detallado:** Sentar las bases del backend para el catálogo de Agentes IA. A diferencia de las Skills, un Agente es un proyecto complejo que no se compone de un solo texto, sino de un árbol de ficheros (código, config, docs) junto con un README principal.

## Alcance
- **Incluye:**
  - Modelo de Dominio de un Agente y su FileTree (Archivos y Directorios).
  - Repositorios e infraestructura. Por ahora, se asume persistencia relacional en DB de la estructura, o almacenamiento directo del blob JSON si no requiere búsqueda profunda por fichero.
  - Casos de uso de CRUD de Agentes.
  - Endpoints tRPC para gestión.
- **NO incluye:**
  - Integración real de sincronización con un repo de GitHub externo (se hará manualmente desde Admin primero para asegurar viabilidad).
  - Ejecución real del agente en el backend (ver playground).

## Criterios de Aceptación
1. La base de datos guarda correctamente entidades `Agent` y su relación con `File` o un payload JSON representando el FileTree.
2. Un endpoint tRPC es capaz de servir todo el árbol de ficheros de un agente al frontend en una sola petición.
3. El frontend de admin podrá enviar un update de ficheros sin corromper la jerarquía.

## Dependencias
- Requiere **Feature 03** (Arquitectura Base).

## Lista de Tasks
1. `task-1-agents-domain-entities.md`: Dominio de Agente y FileTree.
2. `task-2-agents-repositories.md`: Esquema Prisma para jerarquías o JSON.
3. `task-3-agents-use-cases.md`: Casos de uso de guardado complejo.
4. `task-4-agents-trpc-router.md`: Endpoints.
