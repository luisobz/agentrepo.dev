# Task 1: Avatar Click Sequence (Easter Egg)

## Descripción
Implementar el Huevo de Pascua ("Easter Egg") principal del sitio web. El avatar global, al ser clickeado repetidamente en la página pública, reacciona cambiando sus expresiones visuales secuencialmente (animaciones de sorpresa, diversión) y al quinto click consecutivo, desbloquea de manera permanente el acceso al portfolio redirigiendo de inmediato al usuario a `/portfolio/luisbz`.

## Archivos a crear o modificar
- `apps/web/src/modules/shared/avatar/avatar-sprite.tsx` (Capturar clicks).
- `apps/web/src/modules/shared/avatar/avatar-context.tsx` (Control de clicks y persistencia).
- `apps/web/src/app/portfolio/[slug]/page.tsx` (Verificación de acceso).

## Criterios de finalización
- [ ] **Secuencia de Reacciones del Avatar:**
  - **Clicks 1 y 2:** El avatar permanece en estado normal.
  - **Click 3:** Cambia su emoción global a `'surprised'` por 1.5 segundos.
  - **Click 4:** Cambia su emoción global a `'happy'` y vibra ligeramente (CSS shake o micro-animación framer motion).
  - **Click 5:** Dispara la navegación del Next.js Router (`useRouter().push('/portfolio/luisbz')`) de inmediato.
- [ ] **Desbloqueo Permanente (Persistencia):**
  - Al completar la secuencia de 5 clicks, guarda en `localStorage` o `sessionStorage` una bandera `portfolioUnlocked: "true"`.
  - Si el usuario accede directamente a `/portfolio/luisbz` o intenta entrar de nuevo, el sistema lee de `localStorage` si está desbloqueado. Si no está desbloqueado, lo redirige de inmediato a la Home `/` para conservar el aura de misterio y secrecía, a menos que el perfil esté explícitamente en modo público por ENV.
