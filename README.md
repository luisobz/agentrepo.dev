<p align="center">
  <a href="https://agentrepo.dev">
    <img src="docs/assets/brand/banners/readme-banner.jpg" alt="AgentRepo.dev — Discover, learn and build with AI skills and agents" width="100%">
  </a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-7A2230?style=flat-square" alt="License: AGPL-3.0"></a>
  <img src="https://img.shields.io/badge/Node.js-%3E%3D24-7A2230?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 24 or later">
  <img src="https://img.shields.io/badge/pnpm-10.33.4-7A2230?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm 10.33.4">
  <img src="https://img.shields.io/badge/Nx-workspace-2F5D8A?style=flat-square&logo=nx&logoColor=white" alt="Nx workspace">
  <a href="https://github.com/luisobz/agentrepo.dev/actions/workflows/ci.yml"><img src="https://github.com/luisobz/agentrepo.dev/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
</p>

# AgentRepo.dev

Catálogo de skills, proyectos de agentes y artículos sobre IA. Explora sus archivos y referencias, descarga versiones publicadas o instala skills en tu proyecto con el CLI.

**[Web](https://agentrepo.dev) · [Skills](https://agentrepo.dev/skills) · [Agentes](https://agentrepo.dev/agents) · [CLI](https://agentrepo.dev/cli) · [Contribuir](https://agentrepo.dev/creator)**

- **Catálogo:** documentación, archivos y enlaces a los proyectos originales, con snapshots versionados.
- **Creator:** acceso con GitHub o correo para proponer skills, agentes y artículos. Cada propuesta requiere revisión del administrador antes de publicarse.
- **Paquetes de agentes:** varios archivos de texto o un ZIP, con vista previa y límites de tamaño, rutas y contenido. [Validación de subidas](docs/CREATOR.md).
- **CLI interactivo:** selección de herramienta, instalación, verificación y restauración de skills. `agent.json` registra la configuración del proyecto.
- **Panel de administración:** gestión del catálogo y revisión de propuestas, con autorización de administrador independiente del inicio de sesión.

## Instalar el CLI

Requiere Node.js 24+ y pnpm. La versión del CLI se publica de forma independiente de la plataforma.

```sh
pnpm add -g https://github.com/luisobz/agentrepo.dev/releases/download/cli-v0.2.1/agentrepo-cli-0.2.1.tgz
```

Dentro de tu proyecto:

```sh
agentrepo
```

[Guía del CLI](packages/cli/README.md) · [Releases del CLI](https://github.com/luisobz/agentrepo.dev/releases/tag/cli-v0.2.1)

## Desarrollo local

Requiere Node.js 24, pnpm 10.33.4 y Docker Compose para PostgreSQL local.

```sh
git clone https://github.com/luisobz/agentrepo.dev.git
cd agentrepo.dev
pnpm install --frozen-lockfile
cp .env.example .env
```

Configura `.env` con los servicios que vayas a utilizar y arranca el entorno:

```sh
pnpm db:up
pnpm dev
```

```sh
pnpm verify
pnpm build
```

## Monorepo

| Aplicación                                | Función                               |
| ----------------------------------------- | ------------------------------------- |
| [web](apps/web/README.md)                 | Web pública con Next.js 16 y React 19 |
| [admin](apps/admin/README.md)             | Panel de administración con Next.js   |
| [backend-web](apps/backend-web/README.md) | API NestJS y tRPC                     |
| [backend-ai](apps/backend-ai/README.md)   | Flujos de IA con NestJS y LangChain   |

| Paquete                                             | Función                                                  |
| --------------------------------------------------- | -------------------------------------------------------- |
| [domain](packages/domain/README.md)                 | Entidades y reglas de negocio                            |
| [application](packages/application/README.md)       | Casos de uso y puertos                                   |
| [infrastructure](packages/infrastructure/README.md) | Adaptadores de persistencia, correo, almacenamiento e IA |
| [database](packages/database/README.md)             | Prisma, esquema y migraciones PostgreSQL                 |
| [trpc](packages/trpc/README.md)                     | Routers y esquemas compartidos                           |
| [ui](packages/ui/README.md)                         | Componentes y estilos compartidos                        |
| [avatar](packages/avatar/README.md)                 | Avatar animado e interacciones                           |
| [config](packages/config/README.md)                 | Configuración compartida                                 |
| [cli](packages/cli/README.md)                       | Instalador interactivo de skills                         |

Las aplicaciones utilizan casos de uso y adaptadores; el dominio permanece independiente de los frameworks. La interfaz usa Tailwind CSS, Radix UI y Motion. Auth se integra con Supabase; los datos se almacenan en PostgreSQL mediante Prisma.

## Publicación y documentación

GitHub Actions ejecuta CI y despliega la plataforma mediante tags `v*`. También permite actualizar una aplicación concreta. Las releases `cli-v*` distribuyen el CLI por separado.

- [Despliegue y operación](docs/DEPLOY.md)
- [Creator y revisión de propuestas](docs/CREATOR.md)
- [Assets de marca](docs/assets/brand/README.md)
- [Instrucciones para colaboradores y agentes](AGENTS.md)

## Licencia

[GNU Affero General Public License v3.0](LICENSE).
