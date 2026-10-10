# Colaboradores y revisión editorial

`/creator` es el punto de entrada para proponer skills, proyectos completos de agentes y artículos del blog. Requiere una sesión validada por Supabase Auth. Se admite GitHub (una vez configurado su proveedor) y correo con confirmación.

Las propuestas siempre se guardan con la identidad verificada del colaborador y `isPublished=false`; el cliente no puede elegir la autoría ni publicar. Los proyectos de agentes admiten repositorio HTTPS y documentación de instalación/configuración en Markdown. No se ejecuta el código enviado. El límite es 100.000 caracteres por documento; los ficheros subidos tienen un máximo de 100 KB.

El administrador revisa `/admin/review`, abre cada propuesta para editarla y autoriza su publicación. Las listas y consultas públicas excluyen los borradores. El catálogo público se almacena hasta 30 segundos en la caché del servidor; una aprobación puede tardar ese tiempo en reflejarse. Las solicitudes autenticadas y las mutaciones no se comparten en esa caché.

## Configuración de GitHub

La aplicación OAuth existente debe conservar sus otros callbacks y añadir exactamente:

`https://slzvpfnulpltunutfleh.supabase.co/auth/v1/callback`

En Supabase producción, activar el proveedor GitHub con su client ID y client secret, y permitir el retorno `https://agentrepo.dev/auth/callback`. Se solicitan únicamente perfil y correo (`read:user user:email`), sin acceso a repositorios. Los secretos permanecen en el almacén local y en Supabase, nunca en el repositorio. GitHub puede exigir reautenticación del propietario para generar un secreto. Hasta terminar la configuración, el botón de GitHub permanece deshabilitado con una indicación para usar correo. Tras verificar el proveedor, establecer la variable de Actions `NEXT_PUBLIC_GITHUB_AUTH_ENABLED=true` y desplegar la web.

## Validación

- `pnpm verify`: lint y tests del monorepo, incluidos identidad verificada, separación de roles, redirecciones y envío de los tres tipos de propuesta.
- `pnpm build`: las cuatro aplicaciones y sus paquetes.
- `pnpm test:e2e`: navegación desktop/móvil, acceso de colaborador y posición reservada del avatar en el menú. Usa un catálogo público vacío de prueba y no depende de credenciales.
- Las migraciones se ensayan automáticamente contra una copia del esquema público en preproducción antes de producción. La prueba adicional sobre preproducción verifica envío autenticado, cola de revisión, borrador inaccesible públicamente, aprobación exclusiva del administrador, autoría y limpieza de los registros de prueba.
