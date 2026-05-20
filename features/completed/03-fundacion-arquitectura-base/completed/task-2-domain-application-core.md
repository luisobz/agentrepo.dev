# Task 2: Validación del Core de Dominio y Aplicación

## Descripción
La arquitectura de AgentRepo se rige por principios de Clean Architecture/Arquitectura Hexagonal. `packages/domain` debe ser TypeScript puro y `packages/application` solo puede depender de `domain`. Esta tarea consolida esta estructura estableciendo las reglas de linting de Nx (si no estuviesen bien configuradas) y creando ejemplos de interfaces para confirmar que la separación de dependencias es funcional.

## Archivos a crear o modificar
- `.eslintrc.json` (o equivalent lint config donde se evalúe `@nx/enforce-module-boundaries`).
- `packages/domain/src/shared/base.entity.ts` o utilidades generales.
- `packages/application/src/shared/base.use-case.ts` o interfaz port.
- Exportar correctamente en los `index.ts` de estos paquetes.

## Tests que deben escribirse ANTES de implementar
- Archivo: Ejecución de `pnpm nx lint domain`
- Tipo: Estático / Lint.
- Qué debe probar: Intentar introducir un `import * from 'express'` o algo de `infrastructure` dentro de `domain` debe fallar miserablemente.
- Criterios de test superado: El pipeline de linting rechaza explícitamente dependencias inversas y pasa cuando están limpias.

## Criterios de finalización
- [ ] Las reglas `enforce-module-boundaries` de Nx garantizan que `domain` no puede importar nada, `application` solo `domain`, e `infrastructure` a ambos.
- [ ] Existen archivos mínimos base exportados en los paquetes `domain` y `application` (ej. una clase base `Entity` vacía o interfaces genéricas).
- [ ] Los alias de TS (`@agentrepo/domain`, etc.) funcionan correctamente en el IDE y durante compilación.

## Notas Técnicas
- El `nx.json` y el `project.json` de cada librería definen las etiquetas (`scope:domain`, `scope:application`). Asegúrate de que las tags existan.
- Regla típica en ESLint:
  ```json
  "@nx/enforce-module-boundaries": ["error", {
    "depConstraints": [
      { "sourceTag": "scope:domain", "onlyDependOnLibsWithTags": [] },
      { "sourceTag": "scope:application", "onlyDependOnLibsWithTags": ["scope:domain"] }
    ]
  }]
  ```
