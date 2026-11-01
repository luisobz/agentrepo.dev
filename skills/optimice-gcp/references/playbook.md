# Playbook de interpretación GCP

| Área | Qué medir | Pregunta FinOps | Control de riesgo |
|---|---|---|---|
| Compute Engine | CPU media/máxima, RAM y CPU guest agent, I/O | Reducir tamaño o sacar job puntual | Picos, memoria, SLO |
| Cloud Run | Concurrencia, min instances, CPU y request duration | Pagar por inactividad sin necesitarlo | Cold starts y latencia |
| GKE | Pods requests/limits, nodos libres, coste de cluster | Clúster necesario o servicio sencillo | Separación y HA |
| Cloud NAT | Bytes, IPs, instancia asignada, rutas | Gateway/egress caro | Seguridad y conectividad |
| Forwarding rules y LB | QPS, capacidad, reglas y IPs | Recursos sin carga | Tráfico de respaldo |
| Cloud Storage | Standard/Nearline/Coldline/Archive, duración mínima | Almacenamiento frío eficiente | Recuperación y early delete |
| BigQuery | Bytes scanned, partición, clustering, tablas sin lectura | Reducir queries y datos inútiles | Retención legal y SLA |
| Cloud Logging | Ingesta, retention, errores de verdad | Evitar logging de bajo valor | Auditoría y forensics |
| CUDs | Cobertura, utilización, créditos | Compromiso infrautilizado o baseline sin cubrir | Cambios de demanda y familia |
| Cloud CDN y caché | Hit ratio, egress y carga del origen | Evitar escalado por requests repetidas | Contenido privado y expiración |
| Arquitectura | Cloud Run vs GKE/VM, interservice egress | Menos piezas y menos red | Seguridad y SLO |

## Requisitos antes de proponer ahorro

- Factura por SKU/proyecto o CSV existente; las `list` de recursos **no dan precios reales**.
- 14-30 días de métricas representativas y comportamiento de negocio. Cloud Monitoring CPU alineado a un día **oculta picos cortos**: hacer drill down con intervalos menores antes de cambiar tamaños.
- Uso de CUD y créditos diferenciados de precio bruto, mínimos de las clases frías y precio de retrieval.
- Clasificar toda recomendación como A (factura+uso+SLO), B (incompleta) o C (solo metadatos).
- Ahorro neto = coste base comparable − coste futuro comparable − costes secundarios; no hacer suma de descuentos incompatible.

## Monitoring propuesto, sin crear recursos

Coste semanal por proyecto/SKU; gasto por operación; error rate, p95 y disponibilidad; backlog/CPU y memoria; min instances Cloud Run y estado de jobs; coste de Cloud NAT y egress; bytes escaneados BigQuery; storage por clase; utilización CUD. Etiquetar responsables y definir respuesta y umbral, no retener métricas de cardinalidad ilimitada.
