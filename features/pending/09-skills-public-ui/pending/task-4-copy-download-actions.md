# Task 4: Acciones Copy y Download

## Descripción
Implementar la funcionalidad de conveniencia esencial para un repositorio: copiar rápido al portapapeles y descargar como archivo local.

## Archivos a crear o modificar
- Modificar el `markdown-viewer.tsx` o crear un componente hermano de acciones.

## Criterios de finalización
- [ ] Botón de Copy que usa la API `navigator.clipboard.writeText()` para copiar todo el contenido crudo. Debe cambiar su estado visual (ícono check) por un par de segundos tras pulsar.
- [ ] Botón Download que crea un Blob en memoria con el contenido crudo y fuerza la descarga de un fichero `<slug>.md` o `<slug>.txt`.
