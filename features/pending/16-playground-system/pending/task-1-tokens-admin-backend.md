# Task 1: Tokens de Acceso al Playground (Backend)

## Descripción
El Playground cuesta dinero (Llamadas a LLMs). Para limitarlo, requerimos un sistema de Tokens ("Keys") de un solo uso o con límite de peticiones, manejado desde el admin.

## Criterios de finalización
- [ ] Modelo `PlaygroundToken` en Prisma.
- [ ] CRUD y visualización de tokens válidos en `apps/admin`.
- [ ] Endpoint de validación de token y Rate Limiting en `backend-web`.
