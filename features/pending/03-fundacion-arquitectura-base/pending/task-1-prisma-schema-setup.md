# Task 1: Setup del Esquema Base de Prisma y Conexión

## Descripción
En esta tarea se configurará Prisma para conectarse a una base de datos PostgreSQL (Supabase). Crearemos el modelo base inicial para probar la conexión y generaremos los artefactos del cliente Prisma que serán consumidos por el paquete de infraestructura. 

## Archivos a crear o modificar
- `prisma/schema.prisma` (Definición del origen de datos, generador y modelos semilla).
- `.env` y `.env.example` (Variables `DATABASE_URL` y `DIRECT_URL` de Supabase).
- `packages/infrastructure/src/persistence/prisma/prisma.service.ts` (Servicio o wrapper para inyectar Prisma Client).
- Modificar el `package.json` raíz si hay scripts de Prisma a agregar.

## Tests que deben escribirse ANTES de implementar
- Archivo: `packages/infrastructure/src/persistence/prisma/prisma.service.spec.ts`
- Tipo: Test Unitario / Mock.
- Qué debe probar: El servicio `PrismaService` llama al método `$connect` al iniciar el módulo.
- Assertions: Instanciación correcta del servicio. (Dado que no es recomendable testear DB viva en pruebas unitarias puras, probar que la clase se inyecta bien o usar una BD en memoria).

## Criterios de finalización
- [ ] Archivo `schema.prisma` contiene la configuración del provider `postgresql`.
- [ ] Creada al menos una tabla trivial (ej. `HealthCheck` o modelo temporal `TestItem`) y migraciones (`prisma migrate dev`).
- [ ] Creado el servicio/singleton `PrismaService` que inicializa `@prisma/client` y exportado en `packages/infrastructure/src/index.ts`.
- [ ] Variables de entorno bien descritas en `.env.example`.

## Notas Técnicas
- Al usar Supabase es recomendable tener `DATABASE_URL` con connection pooling y `DIRECT_URL` para las migraciones directas si se usa Prisma Accelerate, pero en local basta con PostgreSQL estándar.
- Recuerda instalar o comprobar que existen las dependencias de Prisma en el root: `pnpm add -D prisma` y `pnpm add @prisma/client`.
- El output generado del prisma client a veces necesita ajustes para que Nx lo resuelva adecuadamente en todos los workspaces. (Revisa el output config en el `schema.prisma`).
