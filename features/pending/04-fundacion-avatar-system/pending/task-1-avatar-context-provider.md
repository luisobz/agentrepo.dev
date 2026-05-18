# Task 1: Estado global (Context y Provider) del Avatar

## Descripción
Crear el `AvatarContext` y su Provider para mantener el estado centralizado del avatar. Este estado debe conocer en qué `slot` (un ID string) se encuentra posicionado actualmente el avatar, qué variante emocional o visual tiene (`idle`, `thinking`, `happy`, `clicked`), y proveer funciones para mutar este estado desde cualquier componente anidado.

## Archivos a crear o modificar
- `apps/web/src/components/avatar/avatar-context.tsx` (o equivalente).
- `apps/web/src/app/layout.tsx` (Envolver la app en el provider).

## Tests que deben escribirse ANTES de implementar
- Archivo: `apps/web/src/components/avatar/avatar-context.spec.tsx`
- Tipo: Componente/Hook test.
- Qué debe probar: Renderizar un componente mock dentro del provider, leer el estado del avatar por defecto y disparar un evento que cambie el slot.
- Assertions: El hook `useAvatar()` devuelve la data por defecto correcta, y tras llamar `setSlot('test')` el estado muta adecuadamente.

## Criterios de finalización
- [ ] `AvatarProvider` implementado como un componente cliente (`"use client"`).
- [ ] Exporta un hook `useAvatar` que previene su uso fuera del provider (lanza error).
- [ ] El estado del contexto incluye explícitamente `currentSlot: string | null` y `emotion: 'idle' | 'happy' | 'thinking' | 'surprised'`.
- [ ] `layout.tsx` incluye el Provider en la jerarquía superior (por debajo o dentro de otros providers necesarios).

## Notas Técnicas
- El avatar es un elemento único global, por lo tanto, no debería haber múltiples instancias renderizadas en la pantalla, sino que el estado controla *dónde* está.
- Se aconseja definir un slot default inicial (ej. `currentSlot: 'header'`).
