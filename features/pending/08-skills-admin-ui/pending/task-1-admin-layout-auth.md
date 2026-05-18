# Task 1: Admin Layout y Auth Básico

## Descripción
Configurar el entorno inicial de la aplicación `admin`. Como estamos en las fases tempranas, se requiere un layout con una sidebar básica o menú superior, y un middleware de Next.js que proteja las rutas bajo `/admin` requiriendo autenticación (usando Auth.js v5 o un mock en su defecto hasta su integración plena).

## Archivos a crear o modificar
- `apps/admin/src/app/layout.tsx`
- `apps/admin/src/components/layout/admin-sidebar.tsx`
- `apps/admin/src/middleware.ts` (Opcional auth protection).

## Criterios de finalización
- [ ] Layout principal del admin creado, separado lógicamente del público.
- [ ] Navegación lateral con links a "Dashboard", "Skills", "Agents", "Blog".
- [ ] Seguridad mínima: Configuración base de Auth.js instalada o un middleware simple que redirija si no hay cookie de sesión (puede ser bypass local para dev).
