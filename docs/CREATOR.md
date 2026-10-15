# Colaboradores y revisión editorial

`/creator` es el punto de entrada para proponer skills, proyectos completos de agentes y artículos del blog. Requiere una sesión validada por Supabase Auth. Se admite GitHub (una vez configurado su proveedor) y correo con confirmación.

Las propuestas siempre se guardan con la identidad verificada del colaborador y `isPublished=false`; el cliente no puede elegir la autoría ni publicar. Los proyectos de agentes admiten repositorio HTTPS y documentación de instalación/configuración en Markdown. No se ejecuta el código enviado. Los documentos y cada archivo de código tienen un máximo de 100 KB de texto UTF-8. Los paquetes de agentes admiten hasta 200 archivos y 1 MB de contenido total, incluido README.md.

El administrador revisa `/admin/review`, abre cada propuesta para editarla y autoriza su publicación. Las listas y consultas públicas excluyen los borradores. El catálogo público se almacena hasta 30 segundos en la caché del servidor; una aprobación puede tardar ese tiempo en reflejarse. Las solicitudes autenticadas y las mutaciones no se comparten en esa caché.

## Configuración de GitHub

La aplicación OAuth existente debe conservar sus otros callbacks y añadir exactamente:

`https://slzvpfnulpltunutfleh.supabase.co/auth/v1/callback`

En Supabase producción, activar el proveedor GitHub con su client ID y client secret, y permitir el retorno `https://agentrepo.dev/auth/callback`. Se solicitan únicamente perfil y correo (`read:user user:email`), sin acceso a repositorios. Los secretos permanecen en el almacén local y en Supabase, nunca en el repositorio. GitHub puede exigir reautenticación del propietario para generar un secreto. Hasta terminar la configuración, el botón de GitHub permanece deshabilitado con una indicación para usar correo. Tras verificar el proveedor, establecer la variable de Actions `NEXT_PUBLIC_GITHUB_AUTH_ENABLED=true` y desplegar la web.

## Validación

- `pnpm audit --prod --audit-level=high`: CI y despliegue rechazan avisos altos o críticos. La ausencia de avisos conocidos no garantiza ausencia de vulnerabilidades.
- `pnpm verify`: lint y tests del monorepo, incluidos identidad verificada, separación de roles, redirecciones y envío de los tres tipos de propuesta.
- `pnpm build`: las cuatro aplicaciones y sus paquetes.
- `pnpm test:e2e`: navegación desktop/móvil, acceso de colaborador y posición reservada del avatar en el menú. Usa un catálogo público vacío de prueba y no depende de credenciales.
- Las migraciones se ensayan automáticamente contra una copia del esquema público en preproducción antes de producción. La prueba adicional sobre preproducción verifica envío autenticado, cola de revisión, borrador inaccesible públicamente, aprobación exclusiva del administrador, autoría y limpieza de los registros de prueba.

## Paquetes de agentes

Creator admite varios archivos de texto o un ZIP de hasta 4 MB. El ZIP conserva
las carpetas y elimina una carpeta envolvente común. Si incluye README.md en la
raíz, su contenido rellena el editor; ese editor determina el README definitivo.
Los archivos importados se muestran antes de enviar la propuesta. Los archivos
sin extensión son válidos cuando contienen texto, como scripts en `bin/`.

El visor ordena carpetas primero y agrupa los archivos por extensión, con orden
natural dentro de cada grupo. La selección inicial sigue priorizando README.md.

## Tratamiento de contenido no confiable

El ZIP se procesa exclusivamente en un worker del navegador, terminable tras
20 segundos. Se comprueban CRC, metadatos, tamaños declarados y bytes realmente
expandidos. Se rechazan archivos cifrados, enlaces simbólicos, tipos especiales,
comprimidos anidados y archivos binarios. El lector limita las entradas y procesa
el contenido mediante streams para acotar la expansión.

El servidor recibe JSON con rutas y texto; no recibe ni descomprime el ZIP. Vuelve
a validar cada archivo independientemente del cliente: tamaño UTF-8, cantidad,
profundidad, tipos permitidos, rutas relativas, duplicados y colisiones entre
archivos y carpetas. Se rechazan rutas absolutas, segmentos `..`, separadores de
Windows, nombres reservados y directorios privados o generados. La lectura del
cuerpo HTTP queda limitada por bytes reales antes de parsear JSON, además del
límite del parser del backend. Se rechazan los cuerpos HTTP comprimidos para evitar un descompresor adicional en esta vía.

Las fuentes se guardan en el campo JSON de la base de datos, mediante Prisma.
No se escriben en el filesystem del hosting, se importan como módulos ni se pasan
a shells, intérpretes, compiladores, motores de plantillas o instaladores. Los
campos de transporte se convierten al árbol de archivos y no se entregan a Prisma
como opciones adicionales. El visor escapa el código y deshabilita HTML en
Markdown; no evalúa JavaScript ni MDX. La autoría y la publicación se deciden en
el servidor. Cada cuenta verificada dispone de diez propuestas por hora,
compartidas entre skills, agentes y artículos.

Esta arquitectura no constituye una sandbox de ejecución del servidor. Reduce
la superficie evitando parsers de archivos binarios y ejecución de contenido en
el backend. No garantiza que los scripts distribuidos sean seguros al ejecutarlos:
la revisión editorial debe valorar sus instrucciones, permisos y dependencias.
Cualquier análisis dinámico futuro requiere un servicio aislado, sin credenciales,
red ni montajes de producción, con límites de recursos y estado desechable.

Referencia: [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).
