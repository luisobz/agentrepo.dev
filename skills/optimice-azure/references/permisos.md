# Permisos de auditoría Azure

Reutiliza una identidad existente de consulta, preparada por el administrador para la suscripción acordada. El colector comprueba el UUID y que la sesión pertenece a Azure público. No realiza login ni cambia el contexto activo.

El rol Reader permite muchas lecturas de control plane; no concede acceso general al contenido de blobs o secretos. Los permisos de Cost Management dependen también del ámbito y del contrato de facturación. Las operaciones `Microsoft.CostManagement/query/read` y `Microsoft.CostManagement/query/action` están documentadas como consultas. HTTP POST no convierte esa operación en una modificación de infraestructura.

El ejemplo [rol-auditoria.json](rol-auditoria.json) enumera las lecturas del colector y la consulta de costes, sin DataActions ni un comodín de proveedor. Es una base para revisión, no una certificación de mínimos para todos los tenants y versiones de Azure CLI. Un administrador debe comprobarlo, reemplazar el scope de ejemplo y asignarlo mediante su procedimiento. La skill no crea ni asigna roles.

No asumas que un nombre garantiza permisos estrictamente de lectura: la definición oficial de Cost Management Reader incluye `Microsoft.Support/*`. Si ese acceso adicional no es adecuado, utiliza un rol validado para el propósito. No solicites Owner o Contributor para compensar una consulta fallida.

La utilización de reservas o de savings plans puede requerir un ámbito de facturación distinto. Una respuesta de suscripción incompleta no permite inferir que no existen compromisos sin utilizar. Las métricas de memoria requieren instrumentación ya disponible; la skill no instala agentes.

Fuentes: [Reader](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/general#reader), [Cost Management Reader](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/management-and-governance#cost-management-reader), [operaciones de Cost Management](https://learn.microsoft.com/en-us/azure/role-based-access-control/permissions/management-and-governance#microsoftcostmanagement), [ámbitos de facturación](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/understand-work-scopes).
