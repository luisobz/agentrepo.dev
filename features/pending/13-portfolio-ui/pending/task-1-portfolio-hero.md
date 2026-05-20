# Task 1: Portfolio Hero (Cabecera y Presentación)

## Descripción
Crear la cabecera de la página "secreta" del portfolio en la ruta `/portfolio/[slug]`. Esta sección abandona el estilo de repositorio estándar de la web y adopta una estética de currículum o pitch digital moderno y premium, enfocado en **AI Engineering & Fullstack Dev**.

## Archivos a crear o modificar
- `apps/web/src/modules/web-portfolio/components/portfolio-hero.tsx` (Componente visual).
- `apps/web/src/app/portfolio/[slug]/page.tsx` (Página que importará y estructurará los componentes del portfolio).

## Criterios de finalización
- [ ] Implementar el componente `PortfolioHero` en la ruta modular `apps/web/src/modules/web-portfolio/components/portfolio-hero.tsx`.
- [ ] **Diseño Visual:**
  - Gran cabecera con tipografía Geist Sans / Outfit de alto contraste (`text-5xl` a `text-7xl` con degradado premium, ej. de gris oscuro a blanco plateado en modo oscuro).
  - Nombre completo y rol destacado: "Luisbz — AI Engineer & Senior Fullstack Developer".
  - Breve manifiesto o pitch personal explicativo sobre el desarrollo de agentes autónomos, optimización de LLMs y robustez en backend hexagonal.
- [ ] **Barra de Navegación Minimalista:**
  - Un botón flotante o superior sutil tipo "← Volver al Repositorio" que redirija a la Home `/` usando el componente `Link` de Next.js.
- [ ] **Efectos Micro-animación:**
  - Aparición suave con Framer Motion (`initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}`).

## Notas Técnicas
- El layout general del portfolio debe diferir del layout general del sitio web (por ejemplo, ocultando el header principal dinámico, o reemplazándolo por una variante sumamente minimalista).
