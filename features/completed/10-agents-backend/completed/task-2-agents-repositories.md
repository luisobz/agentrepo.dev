# Task 2: Repositorios y Persistencia de Árboles (Prisma)

## Descripción
El diseño del esquema de BD para guardar árboles puede ser complejo. Como primera aproximación para mantener simplicidad y cumplir "Spaceship Essential", usaremos un campo JSONB en Supabase para el `fileTree`, evitando joins recursivos complejos, dado que el árbol suele ser un snapshot de lectura.

## Criterios de finalización
- [ ] Modelo `Agent` añadido a `schema.prisma`. Incluye campo `fileTree` de tipo `Json`.
- [ ] Opcionalmente, un campo separado `readmeContent` de tipo `String` para FTS fácil.
- [ ] `AgentsRepository` implementado y testeado con mocks.
