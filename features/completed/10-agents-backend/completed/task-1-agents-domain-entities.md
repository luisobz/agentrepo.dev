# Task 1: Entidades de Dominio de Agentes y FileTree

## Descripción
El dominio para un Agente es un agregado complejo. Necesitamos modelar la raíz del Agente y su contenido.

## Criterios de finalización
- [ ] Entidad `Agent`: `id`, `slug`, `title`, `shortDescription`, `version`.
- [ ] Entidad/ValueObject `FileNode`: Un árbol que represente ficheros y carpetas (`name`, `type: 'file' | 'dir'`, `content` (si file), `children` (si dir), `path`).
- [ ] Puerto `AgentsPort` para persistencia.
