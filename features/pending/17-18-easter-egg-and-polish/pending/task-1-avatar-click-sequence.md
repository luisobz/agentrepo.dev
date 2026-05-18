# Task 1: Avatar Click Sequence (Easter Egg)

## Descripción
Implementar el huevo de pascua. El avatar, al ser tocado repetidamente, reacciona y desbloquea el portfolio.

## Criterios de finalización
- [ ] Modificar `AvatarSprite` o `AvatarContext` para llevar un estado de contador de clics (`clickCount`).
- [ ] A los 3 clics cambia emoción a `surprised`.
- [ ] A los 5 clics, lanza la navegación de Next.js (`useRouter().push('/portfolio/luisbz')`) de inmediato.
- [ ] Opción de usar `localStorage` o `sessionStorage` para guardar que el usuario ha "desbloqueado" el portfolio y permitir su acceso futuro directamente sin hacer click.
