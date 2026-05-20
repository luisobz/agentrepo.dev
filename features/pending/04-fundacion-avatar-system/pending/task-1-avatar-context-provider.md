# Task 1: Estado global (Context y Provider) del Avatar

## Descripción
Crear el `AvatarContext` y su Provider para mantener el estado centralizado del avatar. Este estado debe conocer en qué `slot` (un ID string) se encuentra posicionado actualmente el avatar, qué variante emocional o visual tiene (`idle`, `thinking`, `happy`, `clicked`), y proveer funciones para mutar este estado desde cualquier componente anidado.

## Archivos a crear o modificar
- `apps/web/src/modules/shared/avatar/avatar-context.tsx` (Context y Provider).
- `apps/web/src/app/layout.tsx` (Envolver la app en el provider).

## Tests que deben escribirse ANTES de implementar (TDD)
- Archivo: `apps/web/src/modules/shared/avatar/avatar-context.spec.tsx`
- Tipo: Componente/Hook test con Vitest y `@testing-library/react`.
- Qué debe probar:
  1. Renderizar un componente mock de prueba dentro del `AvatarProvider`.
  2. Verificar que se lee el estado por defecto (`currentSlot` es `'header'`, `emotion` es `'idle'`).
  3. Ejecutar la función de cambio de slot y comprobar que muta el estado a la nueva posición.
  4. Lanzar un error controlado si `useAvatar` es consumido fuera del contexto.

## Criterios de finalización
- [ ] `AvatarProvider` implementado como un componente cliente (`"use client"`).
- [ ] Exporta un hook `useAvatar` que previene su uso fuera del provider lanzando un error explicativo.
- [ ] El estado del contexto incluye explícitamente `currentSlot: string | null` y `emotion: 'idle' | 'happy' | 'thinking' | 'surprised'`.
- [ ] `apps/web/src/app/layout.tsx` incluye el Provider en la jerarquía superior por debajo de otros providers globales.

## Notas Técnicas
- El avatar es un elemento único global, por lo tanto, no debería haber múltiples instancias simultáneas renderizadas en la pantalla, sino que el estado controla *dónde* está.
- Se aconseja definir un slot default inicial (ej. `currentSlot: 'header'`).
