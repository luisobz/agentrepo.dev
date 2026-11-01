# Acceso IAM de auditoría GCP

Usar una identidad existente de lectura con alcance explícito **por proyecto**, creada/asignada por un administrador independiente de la skill. Recomendaciones por uso:

- `roles/viewer`: lectura de metadatos de Compute Engine, discos, Cloud SQL, GKE, Cloud Run y buckets cuando el servicio lo permita. No concede necesariamente leer contenido de objetos ni bases de datos, y la auditoría **no** debe hacerlo.
- `roles/monitoring.viewer`: lectura de series de Cloud Monitoring (`monitoring.timeSeries.list`). La skill obtiene temporalmente un token local de la sesión gcloud para llamadas GET; no lo escribe en disco ni lo envía al informe.
- `roles/recommender.computeViewer` o `roles/recommender.viewer` sobre el proyecto: recomendaciones de machine types. Algunos recommenders pueden necesitar otros permisos. No asignar `recommender.editor` o `admin`.
- `roles/billing.viewer` **solo en la cuenta de facturación pertinente**, si se desea inspeccionar costes desde Cloud Billing; no concede acceso automático a tablas BigQuery ni a todos los proyectos.

## Coste detallado y BigQuery

La API de Cloud Billing no sirve un desglose histórico completo de partidas con un simple comando de consulta comparable a Cost Explorer. El script recibe un **CSV local proporcionado por el usuario** (`--cost-csv`) con `service,cost,currency[,project]`, por ejemplo [`costes-ejemplo.csv`](costes-ejemplo.csv). No habilita exportaciones ni ejecuta BigQuery.

Una exportación ya activa a BigQuery puede alimentar ese CSV, pero crear jobs de consulta en BigQuery requiere permisos adicionales (`bigquery.jobs.create`) y puede facturar procesamiento; por eso se deja a un proceso externo controlado y aprobado. No pedir acceso de escritura a datasets, activar APIs, cambiar la facturación ni habilitar exportaciones con esta skill.

```bash
gcloud auth list
python3 scripts/audit.py --project ID_PROYECTO
# Tras revisar el plan y aceptar las llamadas GET y posibles cuotas:
python3 scripts/audit.py --project ID_PROYECTO --execute --out ./resultado-gcp
# Si ya existe un CSV de costes local:
python3 scripts/audit.py --project ID_PROYECTO --cost-csv costes.csv --execute --out ./resultado-gcp
```

Fuentes: [Monitoring roles](https://cloud.google.com/monitoring/access-control), [Billing roles](https://cloud.google.com/billing/docs/how-to/billing-access), [Recommender roles](https://cloud.google.com/iam/docs/roles-permissions/recommender), [Billing export](https://cloud.google.com/billing/docs/how-to/export-data-bigquery).
